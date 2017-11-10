package message

import (
	"github.com/lvfeiyang/proxy/message"
	"net/http"
)

var MhMap map[string]message.MsgHandleIF

func Init() {
	MhMap = map[string]message.MsgHandleIF{
		"qiniu-token-req":  &QiniuTokenReq{},
		"user-save-req": &UserSaveReq{},
		"photo-info-req":   &PhotoInfoReq{},
		"photo-save-req":   &PhotoSaveReq{},
	}
	return
}

type LocMessage message.Message

func (msg *LocMessage) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	message.GeneralServeHTTP((*message.Message)(msg), w, r, MhMap)
}
