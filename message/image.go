package message

import (
	"encoding/json"
	"github.com/lvfeiyang/proxy/common/config"
	"github.com/lvfeiyang/proxy/common/session"
	"github.com/qiniu/api.v7/auth/qbox"
	"github.com/qiniu/api.v7/storage"
)

func qiniuToken(bucket string) string {
	putPolicy := storage.PutPolicy{
		Scope: bucket,
	}
	mac := qbox.NewMac(config.ConfigVal.QiniuAK, config.ConfigVal.QiniuSK)
	return putPolicy.UploadToken(mac)
}

type QiniuTokenReq struct {
	Bucket string
}
type QiniuTokenRsp struct {
	Token string
}

func (req *QiniuTokenReq) GetName() (string, string) {
	return "qiniu-token-req", "qiniu-token-rsp"
}
func (req *QiniuTokenReq) Decode(msgData []byte) error {
	return json.Unmarshal(msgData, req)
}
func (rsp *QiniuTokenRsp) Encode() ([]byte, error) {
	return json.Marshal(rsp)
}
func (req *QiniuTokenReq) Handle(sess *session.Session) ([]byte, error) {
	token := qiniuToken(req.Bucket)
	rsp := &QiniuTokenRsp{token}
	if rspJ, err := rsp.Encode(); err != nil {
		return nil, err
	} else {
		return rspJ, nil
	}
}
