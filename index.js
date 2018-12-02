const express = require('express');
const socket = require('socket.io');
const mongoose = require("mongoose");

//require User Schema
var personSchema = {
  firstName:String,
  lastName:String,
  email:String,
  password:String,
  userType:String,
};

var instructorSchema = {
    instructorName:String,
    instructorEmail:String,
    classIDs:[String],
    classNames:[String]
}

var classSchema = {
    classID:String,
    courseName: String,
    Instructor:String,
    students:[String]
}

//Connect to User database
var conn = mongoose.createConnection('mongodb://cylthus:skittles1@ds121814.mlab.com:21814/lab6users');
var Person = conn.model('Person', personSchema);

//connect to instructor database
var conn2 = mongoose.createConnection('mongodb://cylthus:skittles1@ds053648.mlab.com:53648/lab6instructors')
var instructor = conn2.model('instructor', instructorSchema);

//connect to classes database
var conn3 = mongoose.createConnection('mongodb://cylthus:skittles1@ds137263.mlab.com:37263/classes');
var course = conn3.model('course', classSchema);

//create app
const app = express();
const server = app.listen(8000);
const io = socket(server);

app.use(express.static("login"));
app.use(express.static("student"));

//Connection options
app.get('/', function(req, res) {
    res.sendFile('login.html', {root: __dirname })
});

app.get('/login', function(req, res) {
    res.sendFile('login.html', {root: __dirname })
});

app.get('/CreateAccount', function(req, res) {
    res.sendFile('CreateAccount.html', {root: __dirname })
});


app.get('/InstructorDashboard', function(req, res) {
    res.sendFile('InstructorDashboard.html', {root: __dirname })
});

app.get('/NewCourse', function(req, res) {
    res.sendFile('NewCourse.html', {root: __dirname })
});
io.on('connection',(socket)=>{
  socket.on("register", (data)=>{
      new Person(data).save((error) => {
        if(error){
            console.log('Oops! Could not save person');
        } else {
            //conn.close();
        }
    });
    if(data.userType == "instructor"){
        var obj = {
            instructorName: data.lastName,
            instructorEmail: data.email,
            classIDs:[]
        }
        new instructor(obj).save((error) =>{
            if(error){
                console.log("could not save instructor");
            }
            else {
               // conn2.close();
            }
        });
    }
  });
socket.on("createNewCourse", (data)=>{
    var id = Math.floor(Math.random()*6000);
    while(1){
        var found = false;
        course.findOne({classID: id}, (err, info)=>{
            if(info){
                var found = true;
                id = Math.random()*6000;
            }
        })
        if(!found)break;
    }


    //Save course to course database
    data.classID = id;
    new course(data).save((error) => {
        if(error){
            console.log('oops! Could not save course');
        } else {
           // conn3.close();
        }
    });
    //update instructor's classID's variable in intructor database
    instructor.findOneAndUpdate(
  { "instructorEmail": data.Instructor },
  { $push: { classIDs: id, classNames: data.courseName } },
  { new: true },
  (err, updatedDoc) => {
    // what ever u want to do with the updated document
  })
})

  socket.on("login", (data)=>{
      Person.findOne({"email":data.email, "password":data.password}, (err,x)=>{
            if(x){
             if(x.userType == "instructor"){
                 socket.emit("loginInstructor", x);
             }
            }
        });
  })

  socket.on("getInstructorClasses", (data)=>{
      console.log("Getting classes");
      console.log("Looking up email: "+data.email);
        instructor.findOne({"instructorEmail":data.email}, (err, info)=>{
           console.log("id's found:" + info.classIDs);
            if(info){
                     socket.emit("classInfo", info);
            }
        })
  })
})
