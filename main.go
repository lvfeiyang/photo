package main

import (
	ptDb "github.com/lvfeiyang/photo/common/db"
	"github.com/lvfeiyang/photo/message"
	"github.com/lvfeiyang/proxy/common"
	"github.com/lvfeiyang/proxy/common/config"
	"github.com/lvfeiyang/proxy/common/db"
	"github.com/lvfeiyang/proxy/common/flog"
	"html/template"
	"net/http"
	"path/filepath"
)

var htmlPath string
var pjtCfg config.ProjectConfig

func main() {
	flog.Init()
	config.Init()
	db.Init()
	message.Init()
	httpAddr := ":80"
	htmlPath = config.ConfigVal.HtmlPath
	if pjtCfg = config.GetProjectConfig("photo"); "" == pjtCfg.Name {
		flog.LogFile.Fatal("no photo project!")
	}

	if !pjtCfg.Proxy {
		jsFiles := filepath.Join(htmlPath, "sfk", "js")
		cssFiles := filepath.Join(htmlPath, "sfk", "css")
		fontsFiles := filepath.Join(htmlPath, "sfk", "fonts")
		layDateFiles := filepath.Join(htmlPath, "sfk", "laydate")
		http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir(jsFiles))))
		http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir(cssFiles))))
		http.Handle("/fonts/", http.StripPrefix("/fonts/", http.FileServer(http.Dir(fontsFiles))))
		http.Handle("/laydate/", http.StripPrefix("/laydate/", http.FileServer(http.Dir(layDateFiles))))

		http.Handle("/photo/msg/", &message.LocMessage{})
	} else {
		httpAddr = pjtCfg.Http
	}

	ptjsFiles := filepath.Join(htmlPath, "photo", "html", "js")
	ptcssFiles := filepath.Join(htmlPath, "photo", "html", "css")
	http.Handle("/photo/js/", http.StripPrefix("/photo/js/", http.FileServer(http.Dir(ptjsFiles))))
	http.Handle("/photo/css/", http.StripPrefix("/photo/css/", http.FileServer(http.Dir(ptcssFiles))))

	go common.ListenTcp(pjtCfg.Tcp, message.MhMap)

	http.HandleFunc("/photo/list", photoListHandler)
	http.HandleFunc("/photo/detail", photoHandler)
	flog.LogFile.Fatal(http.ListenAndServe(httpAddr, nil))
}
func photoListHandler(w http.ResponseWriter, r *http.Request) {
	paths := []string{
		filepath.Join(htmlPath, "photo", "html", "user-list.html"),
		// filepath.Join(htmlPath, "photo", "html", "modal", "edit-user.html"),
	}
	if t, err := template.ParseFiles(paths...); err != nil {
		flog.LogFile.Println(err)
	} else {
		type oneView struct {
			Id     string
			Name   string
			Suffix string
			Desc   string
		}
		var view struct {
			UserList  []oneView
			CanModify bool
		}
		if err := r.ParseForm(); err != nil {
			flog.LogFile.Println(err)
		}
		admin := r.Form.Get("user")
		if "admin" == admin {
			view.CanModify = true
		}
		us, err := ptDb.FindAllUsers()
		if err != nil {
			flog.LogFile.Println(err)
		}
		for _, v := range us {
			view.UserList = append(view.UserList, oneView{v.Id.Hex(), v.Name, v.Suffix, v.Desc})
		}
		if err := t.Execute(w, view); err != nil {
			flog.LogFile.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
func photoHandler(w http.ResponseWriter, r *http.Request) {
	paths := []string{
		filepath.Join(htmlPath, "photo", "html", "photo.html"),
		filepath.Join(htmlPath, "photo", "html", "modal", "edit-photo.tmpl"),
	}
	if t, err := template.ParseFiles(paths...); err != nil {
		flog.LogFile.Println(err)
	} else {
		type oneView struct {
			Id      string
			Time    string
			Address string
			Title   string
			Image   string
			Desc    string
		}
		var view struct {
			PhotoList []oneView
			CanModify bool
			Desc      string
			Name      string
			Music     string
			Cover     string
		}
		if err := r.ParseForm(); err != nil {
			flog.LogFile.Println(err)
		}
		user := r.Form.Get("user")
		if "admin" == user {
			view.CanModify = true
		}
		suff := r.Form.Get("suffix")
		u := &ptDb.User{}
		if err := u.GetBySuffix(suff); err != nil {
			flog.LogFile.Println(err)
		}
		view.Desc = u.Desc
		view.Name = u.Name
		view.Music = common.ImgUrlAddQn(u.Music)
		view.Cover = common.ImgUrlAddQn(u.Cover)
		pts, err := ptDb.FindAllPhotos(u.Id.Hex(), 0, 10)
		if err != nil {
			flog.LogFile.Println(err)
		}
		for _, v := range pts {
			view.PhotoList = append(view.PhotoList, oneView{v.Id.Hex(), v.Time, v.Address, v.Title, common.ImgUrlAddQn(v.Image), v.Desc})
		}
		if err := t.Execute(w, view); err != nil {
			flog.LogFile.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}
