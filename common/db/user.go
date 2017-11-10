package db

import (
	"github.com/lvfeiyang/proxy/common/db"
	"gopkg.in/mgo.v2/bson"
)

type User struct {
	Id     bson.ObjectId `bson:"_id,omitempty"`
	Name   string
	Suffix string
	Desc   string
}

const userCName = "user"

func (u *User) GetById(id bson.ObjectId) error {
	return db.FindOneById(userCName, id, u)
}
func (u *User) GetBySuffix(suff string) error {
	return db.FindOne(userCName, bson.M{"suffix": suff}, u)
}
func (u *User) Save() error {
	u.Id = bson.NewObjectId()
	return db.Create(userCName, u)
}
func (u *User) UpdateById() error {
	ud := db.ToMap(u)
	if 0 == len(ud) {
		return nil
	} else {
		return db.UpdateOne(userCName, u.Id, bson.M{"$set": ud})
	}
}
func FindAllUsers() ([]User, error) {
	var us []User
	err := db.FindMany(userCName, bson.M{}, &us, "")
	return us, err
}
func DelUserById(id bson.ObjectId) error {
	return db.DeleteOne(userCName, id)
}
