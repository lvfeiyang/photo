package db

import (
	"github.com/lvfeiyang/proxy/common/db"
	"gopkg.in/mgo.v2/bson"
)

type Photo struct {
	Id      bson.ObjectId `bson:"_id,omitempty"`
	Time    string
	Address string
	Title   string
	Image   string
	Desc    string
	UserId string
}

const photoCName = "photo"

func (pt *Photo) GetById(id bson.ObjectId) error {
	return db.FindOneById(photoCName, id, pt)
}
func (pt *Photo) Save() error {
	pt.Id = bson.NewObjectId()
	return db.Create(photoCName, pt)
}
func (pt *Photo) UpdateById() error {
	ud := db.ToMap(pt)
	if 0 == len(ud) {
		return nil
	} else {
		return db.UpdateOne(photoCName, pt.Id, bson.M{"$set": ud})
	}
}
func FindAllPhotos(uId string) ([]Photo, error) {
	var pts []Photo
	err := db.FindMany(photoCName, bson.M{"userid": uId}, &pts, "time")
	return pts, err
}
func DelPhotoById(id bson.ObjectId) error {
	return db.DeleteOne(photoCName, id)
}
