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
  lastLoggedIn: [Number]
};

var studentSchema = {
    studentName:String,
    studentEmail:String,
    classIDs:[String],
    classNames:[String]
}

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
    students:[String],
    polls:[String],
    pollQuestions:[String]
}

var pollSchema = {
    pollID:String,
    classID:String,
    question:String,
    correctAnswer:String,
    options:[String],
    studentsVoted:[String],
    studentVotes:[String],
    numberOfVotes:Number,
    studentsInRange:Number,
    status:String
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


//connect to poll database
var conn4 =  mongoose.createConnection('mongodb://cylthus:skittles1@ds123664.mlab.com:23664/lab6polls');
var poll = conn4.model('poll', pollSchema);

//connect to student database
var conn5 = mongoose.createConnection('mongodb://cylthus:skittles1@ds229732.mlab.com:29732/lab6students')
var student = conn5.model('student', studentSchema);

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

app.get('/PastPoll', function(req, res){
    res.sendFile('PastPoll.html', {root: __dirname });
})
app.get('/NewPoll', function(req, res) {
    res.sendFile('NewPoll.html', {root: __dirname })
});
app.get('/CurrentPoll', function(req, res) {
    res.sendFile('CurrentPoll.html', {root: __dirname })
});
app.get('/login', function(req, res) {
    res.sendFile('login.html', {root: __dirname })
});
app.get('/InstructorCourse', function(req, res) {
    res.sendFile('InstructorCourse.html', {root: __dirname })
});

app.get('/StudentCourse', function(req, res){
    res.sendFile('StudentCourse.html', {root: __dirname})
})

app.get("/CurrentPollStudent", function(req, res){
    res.sendFile('CurrentPollStudent.html', {root: __dirname})
})
app.get('/CreateAccount', function(req, res) {
    res.sendFile('CreateAccount.html', {root: __dirname })
});

app.get('/StudentDashboard', function(req, res){
    res.sendFile('StudentDashboard.html', {root: __dirname })
})
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
    else {
         var obj = {
            studentName: data.lastName,
            studentEmail: data.email,
            classIDs:[],
            classNames:[]
        }
        new student(obj).save((error) =>{
            if(error){
                console.log("could not save student");
            }
            else {
               // conn5.close();
            }
        });
    }
  });
  socket.on("getClass", (data)=>{
      course.findOne({classID: data.classID}, (err, info)=>{
            if(info){
                socket.emit("returnClass", info);
            }
        })
  })
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
    data.polls = [];
    for(var i = 0; i < data.students.length; i++){
        student.findOneAndUpdate(
            { "studentEmail": data.students[i] }, 
            {$push: { classIDs: id, classNames: data.courseName } },
            {new: true},
            (err, updatedDoc)=>{
            })
    }
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
socket.on('vote', (data)=>{
    var user = data.user;
    var studentLoc;
    var instructorLoc;
    Person.findOne({'email': user}, (err, info)=>{
            if(info){
                studentLoc = info.lastLoggedIn;
            }
    })
    var vote;
    switch(data.id){
        case 'optA':
        vote = 'A';
        break;
        case 'optB':
        vote = 'B';
        break;
        case 'optC':
        vote = 'C';
        break;
        case 'optD':
        vote = 'D';
        break;
    }
    pollID = data.pollID;

    var studentAlreadyVoted=false;
    var votedIndex = -1;
    poll.findOne({'pollID':pollID}, (err, info)=>{
        if(info){
            course.findOne({'classID': info.classID}, (err, t)=>{
                Person.findOne({email: t.Instructor}, (err, r)=>{
                    instructorLoc = r.lastLoggedIn;
                    var latitudeMax = Math.max(studentLoc[0], instructorLoc[0]);
                    var latitudeMin = Math.min(studentLoc[0], instructorLoc[0]);
                    var latitudeDiff;
                    var longitudeDiff;
                    latitudeDiff = latitudeMax-latitudeMin;
                    var longitudeMax = Math.max(studentLoc[1], instructorLoc[1]);
                    var longitudeMin = Math.min(studentLoc[1], instructorLoc[1]);
                    longitudeDiff = longitudeMax - longitudeMin;
                    



                    if(latitudeDiff < .00001 && longitudeDiff < .00001){
                        for(var i = 0; i < info.studentsVoted.length; i++){
                            if(info.studentsVoted[i] == user){
                                console.log('student already voted!');
                                studentAlreadyVoted = true;
                                info.studentVotes[i] = vote;
                                poll.findOneAndUpdate(
                                { "pollID": pollID },
                                { $set: { studentsVoted: info.studentsVoted, studentVotes: info.studentVotes } },
                                { new: true },
                                (err, updatedDoc) => {
    // 
                                })
                                socket.emit("voteRegistered");
                                socket.broadcast.emit('updateChart');
                                return;
                           }
                        }
                         poll.findOneAndUpdate(
                        { "pollID": pollID },
                        { $push: { studentsVoted: user, studentVotes: vote }, $inc: {numberOfVotes: 1} },
                        { new: true },
                        (err, updatedDoc) => {
                        // 

                    })
                        socket.emit("voteRegistered");
                        socket.broadcast.emit('updateChart');
                    }
                    else {
                        socket.emit("outOfRange");
                    }
                })
            })
        }
    })
})
socket.on("checkRange", (data)=>{
 var studentLoc;
    var instructorLoc;
    Person.findOne({'email': data.user}, (err, info)=>{
            if(info){
                studentLoc = info.lastLoggedIn;
            }
    })
    poll.findOne({'pollID':data.pollID}, (err, info)=>{
        if(info){
            course.findOne({'classID': info.classID}, (err, t)=>{
                Person.findOne({email: t.Instructor}, (err, r)=>{
                    instructorLoc = r.lastLoggedIn;
                    var latitudeMax = Math.max(studentLoc[0], instructorLoc[0]);
                    var latitudeMin = Math.min(studentLoc[0], instructorLoc[0]);
                    var latitudeDiff;
                    var longitudeDiff;
                    latitudeDiff = latitudeMax-latitudeMin;
                    var longitudeMax = Math.max(studentLoc[1], instructorLoc[1]);
                    var longitudeMin = Math.min(studentLoc[1], instructorLoc[1]);
                    longitudeDiff = longitudeMax - longitudeMin;
                    



                    if(latitudeDiff < .001 && longitudeDiff < .001){
                        if(data.unload){
                            poll.findOneAndUpdate(
                        { "pollID": data.pollID },
                        {  $inc: {studentsInRange: -1} },
                        { new: true },
                        (err, updatedDoc) => {
                        // 

                    })
                        }
                        else {
                        poll.findOneAndUpdate(
                        { "pollID": data.pollID },
                        {  $inc: {studentsInRange: 1} },
                        { new: true },
                        (err, updatedDoc) => {
                        // 

                    })
                        }
                        var obj = {};
                        poll.findOne({'pollID': data.pollID}, (err, info)=>{
                            obj.numberOfVotes = info.numberOfVotes;
                            obj.studentsInRange = info.studentsInRange;
                            socket.broadcast.emit("updateStudentsInRange");
                        })

                    }
                })
            })
        }
    })
})
socket.on("getPollStatus", (data)=>{
    poll.findOne({pollID: data.pollID}, (err, info)=>{
        if(data.updateStudents){
            socket.emit("updateStudents", info);
        }
        else{
        socket.emit("returnPollInfo", info);
        }
    })
})
socket.on("createPoll", (data)=>{
    var id = Math.floor(Math.random()*6000);
    while(1){
        var found = false;
        poll.findOne({pollID: id}, (err, info)=>{
            if(info){
                var found = true;
                id = Math.random()*6000;
            }
        })
        if(!found)break;
    }


    //Save course to course database
    data.pollID = id;
    data.status = "current";
    data.numberOfVotes = 0;
    data.studentsInRange = 0;
    new poll(data).save((error) => {
        if(error){
            console.log('oops! Could not save course');
        } else {
           // conn3.close();
        }
    });
    //update instructor's classID's variable in intructor database
    course.findOneAndUpdate(
  { "classID": data.classID },
  { $push: { polls: id, pollQuestions:data.question } },
  { new: true },
  (err, updatedDoc) => {
    // what ever u want to do with the updated document
  })
})
socket.on("getPolls", (data)=>{
    id = data.classID;
    course.findOne({"classID": id}, (err, info)=>{
        if(info){
            socket.emit("returnPolls", info);
        }
    })
})
socket.on("endPoll", (data)=>{
    console.log("ending poll: "+data.pollID);
       poll.findOneAndUpdate(
  { "pollID": data.pollID },
  { $set: { status: "past"} },
  { new: true },
  (err, updatedDoc) => {
    // what ever u want to do with the updated document
  })
  socket.emit("endPollDone");
})
socket.on("checkForInstructor", (data)=>{
    console.log("user's email: "+data.user);
    poll.findOne({pollID: data.pollID}, (err, info)=>{
        if(info){
            course.findOne({classID: info.classID}, (err, x)=>{
                console.log("Poll instructor: "+x.Instructor);
                if(x.Instructor == data.user){
                    socket.emit("pollEnded", {x:true});
                }
                else {
                    console.log("Instructors not equal");
                }
            })
        }
    })
})

  socket.on("login", (data)=>{
      Person.findOne({"email":data.email, "password":data.password}, (err,x)=>{
            if(x){
                 Person.findOneAndUpdate(
                 { "email": data.email, "password":data.password },
                 { $set: { lastLoggedIn: data.lastLoggedIn} },
                 { new: true },
                 (err, updatedDoc) => {
                    // what ever u want to do with the updated document
                 })
             if(x.userType == "instructor"){
                 socket.emit("loginInstructor", x);
             }
             else{
                 socket.emit("loginStudent", x);
             }
            }
        });
  })

  socket.on("getInstructorClasses", (data)=>{
        instructor.findOne({"instructorEmail":data.email}, (err, info)=>{
           console.log("id's found:" + info.classIDs);
            if(info){
                     socket.emit("classInfo", info);
            }
        })
  })

  socket.on("getStudentClasses", (data)=>{
        student.findOne({"studentEmail":data.email}, (err, info)=>{
           console.log("id's found:" + info.classIDs);
            if(info){
                     socket.emit("classInfo", info);
            }
        })
  })
})
