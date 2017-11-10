package message

import (
	"encoding/json"
	"github.com/lvfeiyang/proxy/common/session"
	"github.com/lvfeiyang/photo/common/db"
	"gopkg.in/mgo.v2/bson"
)

type UserSaveReq struct {
	Id string
	Name string
	Suffix string
	Desc string
}
type UserSaveRsp struct {
	Result bool
	Id string
}

func (req *UserSaveReq) GetName() (string, string) {
	return "user-save-req", "user-save-rsp"
}
func (req *UserSaveReq) Decode(msgData []byte) error {
	return json.Unmarshal(msgData, req)
}
func (rsp *UserSaveRsp) Encode() ([]byte, error) {
	return json.Marshal(rsp)
}
func (req *UserSaveReq) Handle(sess *session.Session) ([]byte, error) {
	reqToDb := func(req *UserSaveReq, u *db.User) {
		if "" != req.Name {
			u.Name = req.Name
		}
		if "" != req.Suffix {
			u.Suffix = req.Suffix
		}
		if "" != req.Desc {
			u.Desc = req.Desc
		}
	}

	rsp := &UserSaveRsp{false, ""}
	if bson.IsObjectIdHex(req.Id) {
		u := &db.User{Id: bson.ObjectIdHex(req.Id)}
		reqToDb(req, u)
		if err := u.UpdateById(); err != nil {
			return nil, err
		}
	} else {
		u := &db.User{}
		reqToDb(req, u)
		if err := u.Save(); err != nil {
			return nil, err
		}
		rsp.Id = u.Id.Hex()
	}

	rsp.Result = true;
	if rspJ, err := rsp.Encode(); err != nil {
		return nil, err
	} else {
		return rspJ, nil
	}
}
