package message

import (
	"encoding/json"
	"github.com/lvfeiyang/proxy/common/session"
	"github.com/lvfeiyang/proxy/common"
	"github.com/lvfeiyang/photo/common/db"
	"gopkg.in/mgo.v2/bson"
	// "github.com/lvfeiyang/proxy/message"
)

type PhotoInfoReq struct {
	Id string
}
type PhotoInfoRsp struct {
	Time    string
	Address string
	Title   string
	Image   string
	Desc    string
}

func (req *PhotoInfoReq) GetName() (string, string) {
	return "photo-info-req", "photo-info-rsp"
}
func (req *PhotoInfoReq) Decode(msgData []byte) error {
	return json.Unmarshal(msgData, req)
}
func (rsp *PhotoInfoRsp) Encode() ([]byte, error) {
	return json.Marshal(rsp)
}
func (req *PhotoInfoReq) Handle(sess *session.Session) ([]byte, error) {
	pt := db.Photo{}
	if bson.IsObjectIdHex(req.Id) {
		(&pt).GetById(bson.ObjectIdHex(req.Id))
	}
	rsp := &PhotoInfoRsp{pt.Time, pt.Address, pt.Title, common.ImgUrlAddQn(pt.Image), pt.Desc}
	if rspJ, err := rsp.Encode(); err != nil {
		return nil, err
	} else {
		return rspJ, nil
	}
}

type PhotoSaveReq struct {
	Id      string
	Time    string
	Address string
	Title   string
	Image   string
	Desc    string
	Suffix string
}
type PhotoSaveRsp struct {
	Result bool
}

func (req *PhotoSaveReq) GetName() (string, string) {
	return "photo-save-req", "photo-save-rsp"
}
func (req *PhotoSaveReq) Decode(msgData []byte) error {
	return json.Unmarshal(msgData, req)
}
func (rsp *PhotoSaveRsp) Encode() ([]byte, error) {
	return json.Marshal(rsp)
}
func (req *PhotoSaveReq) Handle(sess *session.Session) ([]byte, error) {
	reqToDb := func(req *PhotoSaveReq, pt *db.Photo) {
		if "" != req.Time {
			pt.Time = req.Time
		}
		if "" != req.Address {
			pt.Address = req.Address
		}
		if "" != req.Title {
			pt.Title = req.Title
		}
		if "" != req.Image {
			pt.Image = req.Image
		}
		if "" != req.Desc {
			pt.Desc = req.Desc
		}
		if "" != req.Suffix {
			u := &db.User{}
			if err := u.GetBySuffix(req.Suffix); err != nil {
				// return message.NormalError(message.ErrNoUser)
			} else {
				pt.UserId = u.Id.Hex()
			}

		}
		return
	}

	if bson.IsObjectIdHex(req.Id) {
		pt := &db.Photo{Id: bson.ObjectIdHex(req.Id)}
		reqToDb(req, pt)
		if err := pt.UpdateById(); err != nil {
			return nil, err
		}
	} else {
		pt := &db.Photo{}
		reqToDb(req, pt)
		if err := pt.Save(); err != nil {
			return nil, err
		}
	}
	rsp := &PhotoSaveRsp{true}
	if rspJ, err := rsp.Encode(); err != nil {
		return nil, err
	} else {
		return rspJ, nil
	}
}
