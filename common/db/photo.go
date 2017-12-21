package db

import (
	"github.com/lvfeiyang/proxy/common/db"
	"github.com/lvfeiyang/proxy/common/qiniu"
	"gopkg.in/mgo.v2/bson"
)

type Photo struct {
	Id      bson.ObjectId `bson:"_id,omitempty"`
	Time    string
	Address string
	Title   string
	Image   string
	Desc    string
	UserId  string
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
func FindAllPhotos(uId string, offset, limit int) ([]Photo, error) {
	var pts []Photo
	err := db.FindMany(photoCName, bson.M{"userid": uId}, &pts, db.Option{"time", offset, limit})
	return pts, err
}
func DelPhotoById(id bson.ObjectId) error {
	return db.DeleteOne(photoCName, id)
}
func DelRepeatPhoto() error {
	//删除七牛hash重复项
	bucket := "photo"
	if files, err := qiniu.DelRepeatFile(bucket); err != nil {
		return err
	} else {
		for _, file := range files {
			db.DeleteMany(photoCName, bson.M{"image": bucket + "/" + file})
		}
	}
	//删除数据库image重复项
	m := []bson.M{
		{"$group": bson.M{"_id": "$image", "count": bson.M{"$sum": 1}}},
		{"$match": bson.M{"count": bson.M{"$gt": 1}}},
	}
	var agg []struct {
		Image string `bson:"_id"`
		Count string
	}
	if err := db.Aggregate(photoCName, m, &agg); err != nil {
		return err
	}
	var pts []Photo
	for _, v := range agg {
		db.FindMany(photoCName, bson.M{"image": v.Image}, &pts, db.Option{})
		for i, pt := range pts {
			if i > 0 {
				db.DeleteOne(photoCName, pt.Id)
			}
		}
		// db.DeleteMany(photoCName, bson.M{"image": v.Image})
	}
	return nil
}
func FindNoMapFiles() ([]string, error) {
	var noMapFiles []string
	bucket := "photo"
	if files, err := qiniu.GetAllFile(bucket); err != nil {
		return noMapFiles, err
	} else {
		pt := &Photo{}
		for _, file := range files {
			if err := db.FindOne(photoCName, bson.M{"image": bucket + "/" + file}, pt); err != nil {
				if "not found" == err.Error() {
					noMapFiles = append(noMapFiles, file)
				} else {
					return noMapFiles, err
				}
			}
		}
	}
	return noMapFiles, nil
}
