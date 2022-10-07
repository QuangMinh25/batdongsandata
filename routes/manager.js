var express = require('express');
var router = express.Router();
var User = require('../models/user');
var UserSalary = require('../models/user_salary');
var PaySlip = require('../models/payslip');
var Leave = require('../models/leave');
var Attendance = require('../models/attendance');
var moment = require('moment');
var Project = require('../models/project');
var PerformanceAppraisal = require('../models/performance_appraisal');
var flash = require('connect-flash');
var csrf = require('csurf');
var csrfProtection = csrf();
var Bds = require('../models/bds');
var config_passport = require('../config/passport.js');
router.use('/', isLoggedIn, function checkAuthentication(req, res, next) {
    next();
});

/**
 * Description:
 * Displays home to the manager
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/', function viewHomePage(req, res, next) {

    res.render('Manager/managerHome', {
        title: 'Manager Home',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});


/**
 * Description:
 * Checks which type of manager is logged in.
 * Displays the list of employees to the manager respectively.
 * In case of accounts manager checks if user has entry in UserSalary Schema.
 * Then it enters the data in UserSalary Schema if user is not present.
 * Otherwise gets the data from UserSalary Schema and shows the salary of the employees to the accounts manager
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */


//////////////////
router.get('/view-all-bds', function viewAllBds(req, res, next) {
    var bdsChunks = [];
    //find is asynchronous function
    Bds.find({}).sort({_id: -1}).exec(function getBdss(err, docs) {
        for (var i = 0; i < docs.length; i++) {
            bdsChunks.push(docs[i]);
        }
        res.render('manager/viewAllbds', {
            title: 'Tất cả dự án',
            csrfToken: req.csrfToken(),
            bdss: bdsChunks,
            userName: req.session.user.name
        });
    });

   
});
router.get('/add-bds', function addBds(req, res, next) {
    var messages = req.flash('error');
    var newBds = new Bds();
    res.render('manager/addbds', {
        title: 'Add Bds',
        csrfToken: req.csrfToken(),
        user: config_passport.User,
        messages: messages,
        hasErrors: messages.length > 0,
        userName: req.session.user.name
    });

});
router.post('/add-bds', function addBds(req, res) {
    var newBds = new Bds();
    newBds.gia = req.body.gia;
    newBds.sonha = req.body.sonha;
    newBds.duong = req.body.duong;
    newBds.phuong = req.body.phuong;
    newBds.quan = req.body.quan;
    newBds.dientich = req.body.dientich;
    newBds.cautruc = req.body.cautruc;
    newBds.vitri = req.body.vitri;
    newBds.chusohuu = req.body.chusohuu;
    newBds.trangthai = req.body.trangthai;
    newBds.lienhe = req.body.lienhe;

    newBds.save(function saveBds(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/manager/view-all-bds/');
    });
});
router.post('/delete-bds/:id', function deleteBds(req, res) {
    var id = req.params.id;
    Bds.findByIdAndRemove({_id: id}, function deleteBds(err) {
        if (err) {
            console.log('unable to delete bds');
        }
        else {
            res.redirect('/manager/view-all-bds');
        }
    });
});

router.post('/edit-bds/:id', function editBds(req, res) {
    var bdsId = req.params.id;
    var newBds = new Bds();
    Bds.findById(bdsId, function (err, bds) {
        if (err) {
            console.log(err);
        }
        bds.gia = req.body.gia;
        bds.sonha = req.body.sonha;
        bds.duong = req.body.duong;
        bds.phuong = req.body.phuong;
        bds.quan = req.body.quan;
        bds.dientich = req.body.dientich;
        bds.cautruc = req.body.cautruc;
        bds.vitri = req.body.vitri;
        bds.chusohuu = req.body.chusohuu;
        bds.trangthai = req.body.trangthai;
        bds.lienhe = req.body.lienhe;

        bds.save(function saveBds(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/manager/bds-profile/' + bdsId);

        });
    });
});
router.get('/bds-profile/:id', function getBdsProfile(req, res, next) {
    var bdsId = req.params.id;
    Bds.findById(bdsId, function getBds(err, bds) {
        if (err) {
            console.log(err);
        }
        res.render('manager/bdsProfile', {
            title: 'bds Profile',
            bdss: bds,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });

    });
});
router.get('/edit-bds/:id', function editbds(req, res, next) {
    var bdsId = req.params.id;
    Bds.findById(bdsId, function getBds(err, bds) {
        if (err) {
            res.redirect('/manager/');
        }
        res.render('manager/editBds', {
            title: 'Edit Bds',
            csrfToken: req.csrfToken(),
            bdss: bds,
            moment: moment,
            message: '',
            userName: req.session.user.name
        });


    });

});
/////////////////

router.get('/view-employees', function viewEmployees(req, res) {

    var userChunks = [];
    var chunkSize = 3;
    if (req.user.type === 'project_manager') {
        //find is asynchronous function
        User.find({type: 'employee'}).sort({_id: -1}).exec(function getUser(err, docs) {
            for (var i = 0; i < docs.length; i++) {
                userChunks.push(docs[i]);
            }
            res.render('Manager/viewemp_project', {
                title: 'List Of Employees',
                csrfToken: req.csrfToken(),
                users: userChunks, errors: 0, userName: req.session.user.name
            });

        });
    }
    else if (req.user.type === 'accounts_manager') {
        //find is asynchronous function
        var salaryChunks = [];

        User.find({$or: [{type: 'employee'}, {type: 'project_manager'}]}).sort({_id: -1}).exec(function getUser(err, docs) {
            if (err) {
                console.log(err);
            }
            for (var i = 0; i < docs.length; i++) {
                userChunks.push(docs[i]);
            }

        });

        setTimeout(getUserSalaries, 900);

        function getUserSalaries() {


            function callback(i) {
                if (i < userChunks.length) {
                    UserSalary.find({employeeID: userChunks[i]._id}, function (err, salary) {
                        console.log(i);

                        if (err) {
                            console.log(err);
                        }
                        if (salary.length > 0) {
                            salaryChunks.push(salary[0]);
                        }
                        else {
                            var newSalary = new UserSalary();
                            newSalary.accountManagerID = req.session.user._id;
                            newSalary.employeeID = userChunks[i]._id;
                            newSalary.save(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                salaryChunks.push(newSalary);
                            })
                        }

                        callback(i + 1);
                    });
                }
            }

            callback(0);

        }

        setTimeout(render_view, 2000);
        function render_view() {


            res.render('Manager/viewemp_accountant', {
                title: 'List Of Employees', csrfToken: req.csrfToken(),
                users: userChunks, salary: salaryChunks, userName: req.session.user.name
            });

        }


    }


});

/**
 * Description:
 * Displays All the skills of the employee to the project manager.
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/all-employee-skills/:id', function viewAllEmployeeSkills(req, res, next) {

    var employeeId = req.params.id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        res.render('Manager/employeeSkills', {
            title: 'List Of Employee Skills',
            employee: user,
            moment: moment,
            csrfToken: req.csrfToken(),
            userName: req.session.user.name
        });

    });
});

/**
 * Description:
 * Displays all the projects of the employee to the project manager
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/all-employee-projects/:id', function viewAllEmployeeProjects(req, res, next) {

    var employeeId = req.params.id;
    var projectChunks = [];

    //find is asynchronous function
    Project.find({employeeID: employeeId}).sort({_id: -1}).exec(function getProject(err, docs) {
        var hasProject = 0;
        if (docs.length > 0) {
            hasProject = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            projectChunks.push(docs[i]);
        }
        User.findById(employeeId, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            res.render('Manager/employeeAllProjects', {
                title: 'List Of Employee Projects',
                hasProject: hasProject,
                projects: projectChunks,
                csrfToken: req.csrfToken(),
                user: user,
                userName: req.session.user.name
            });
        });

    });
});

/**
 * Description:
 * Displays employee project information to the project manager
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/employee-project-info/:id', function viewEmployeeProjectInfo(req, res, next) {

    var projectId = req.params.id;
    Project.findById(projectId, function getProject(err, project) {
        if (err) {
            console.log(err);
        }
        User.findById(project.employeeID, function getUser(err, user) {
            if (err) {
                console.log(err);
            }
            res.render('Manager/projectInfo', {
                title: 'Employee Project Information',
                project: project,
                employee: user,
                moment: moment,
                csrfToken: req.csrfToken(),
                message: '',
                userName: req.session.user.name
            });
        })

    });

});

/**
 * Description:
 * Displays the performance appraisal form for the employee to the project manager.
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/provide-performance-appraisal/:id', function providePerformanceAppraisal(req, res, next) {

    var employeeId = req.params.id;
    var userChunks = [];
    PerformanceAppraisal.find({employeeID: employeeId}, function getPerformanceAppraisal(err, pa) {
        if (pa.length > 0) {
            User.find({type: 'employee'}, function getUser(err, docs) {
                for (var i = 0; i < docs.length; i++) {
                    userChunks.push(docs[i]);
                }
                res.render('Manager/viewemp_project', {
                    title: 'List Of Employees',
                    csrfToken: req.csrfToken(),
                    users: userChunks, errors: 1,
                    userName: req.session.user.name
                });

            });

        }
        else {
            User.findById(employeeId, function getUser(err, user) {

                if (err) {
                    console.log(err);
                }
                res.render('Manager/performance_appraisal', {
                    title: 'Provide Performance Appraisal',
                    csrfToken: req.csrfToken(),
                    employee: user,
                    moment: moment,
                    message: '',
                    userName: req.session.user.name
                });

            });
        }
    })


});

/**
 * Description:
 * Displays currently marked attendance to the manager.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-attendance-current', function viewCurrentMarkedAttendance(req, res, next) {

    var attendanceChunks = [];

    Attendance.find({
        employeeID: req.user._id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    }).sort({_id: -1}).exec(function getAttendanceSheet(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            attendanceChunks.push(docs[i]);
        }
        res.render('Manager/viewAttendance', {
            title: 'Attendance Sheet',
            month: new Date().getMonth() + 1,
            csrfToken: req.csrfToken(),
            found: found,
            attendance: attendanceChunks,
            moment: moment,
            userName: req.session.user.name
        });
    });
});

/**
 * Description:
 * Displays leave application form for the manager to apply for leave
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/apply-for-leave', function applyForLeave(req, res, next) {

    res.render('Manager/managerApplyForLeave', {
        title: 'Apply for Leave',
        csrfToken: req.csrfToken(),
        userName: req.session.user.name
    });
});

/**
 * Description:
 * Manager gets the list of all his/her applied leaves.
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/applied-leaves', function appliedLeaves(req, res, next) {

    var leaveChunks = [];

    //find is asynchronous function
    Leave.find({applicantID: req.user._id}).sort({_id: -1}).exec(function getLeave(err, docs) {
        var hasLeave = 0;
        if (docs.length > 0) {
            hasLeave = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            leaveChunks.push(docs[i]);
        }

        res.render('Manager/managerAppliedLeaves', {
            title: 'List Of Applied Leaves',
            csrfToken: req.csrfToken(),
            hasLeave: hasLeave,
            leaves: leaveChunks,
            userName: req.session.user.name
        });
    });

});


/**
 * Description:
 * Displays logged in manager his/her profile.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-profile', function viewProfile(req, res, next) {

    User.findById(req.user._id, function getUser(err, user) {
        if (err) {
            console.log(err);

        }
        res.render('Manager/viewManagerProfile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            employee: user,
            moment: moment,
            userName: req.session.user.name
        });
    });

});

/**
 * Description:
 * Gets the id of the project to be shown form request parameters.
 * Displays the project to the project manager.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/view-project/:project_id', function viewProject(req, res, next) {

    var projectId = req.params.project_id;
    Project.findById(projectId, function getProject(err, project) {
        if (err) {
            console.log(err);
        }
        res.render('Manager/viewManagerProject', {
            title: 'Project Details',
            project: project,
            csrfToken: req.csrfToken(),
            moment: moment,
            userName: req.session.user.name
        });

    });


});

/**
 * Description:
 * Displays list of all the project managers project.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016 Salman Nizam
 *
 * Known Bugs: None
 */

router.get('/view-all-personal-projects', function viewAllPersonalProjects(req, res, next) {

    var projectChunks = [];
    Project.find({employeeID: req.user._id}).sort({_id: -1}).exec(function getProject(err, docs) {
        var hasProject = 0;
        if (docs.length > 0) {
            hasProject = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            projectChunks.push(docs[i]);
        }
        res.render('Manager/viewManagerPersonalProjects', {
            title: 'List Of Projects',
            hasProject: hasProject,
            projects: projectChunks,
            csrfToken: req.csrfToken(),
            userName: req.session.user.name
        });

    });

});

/**
 * Description:
 * Checks if pay slip has already been generated.
 * If yes then fills the field of the form with current attributes.
 * Then displays the pay slip form for the employee to the project manager.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.get('/generate-pay-slip/:employee_id', function generatePaySlip(req, res, next) {

    var employeeId = req.params.employee_id;
    User.findById(employeeId, function getUser(err, user) {
        if (err) {
            console.log(err);
        }
        PaySlip.find({employeeID: employeeId}, function getPaySlip(err, docs) {

            var pay_slip;
            var hasPaySlip = 0;
            if (docs.length > 0) {
                hasPaySlip = 1;
                pay_slip = docs[0];
            }
            else {
                var newPS = new PaySlip();
                newPS.accountManagerID = req.user._id;
                newPS.employeeID = employeeId;
                newPS.bankName = 'abc';
                newPS.branchAddress = 'abc';
                newPS.basicPay = 0;
                newPS.overtime = 0;
                newPS.conveyanceAllowance = 0;

                newPS.save(function savePaySlip(err) {
                    if (err) {
                        console.log(err);
                    }
                    pay_slip = newPS;

                })

            }

            setTimeout(render_view, 900)
            function render_view() {
                res.render('Manager/generatePaySlip', {
                    title: 'Generate Pay Slip',
                    csrfToken: req.csrfToken(),
                    employee: user,
                    pay_slip: pay_slip,
                    moment: moment,
                    hasPaySlip: hasPaySlip
                    , userName: req.session.user.name
                });
            }
        });

    });


});

/**
 * Description:
 * Reads the parameters from the body of the post request.
 * Then saves the applied leave to the leave schema.
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/apply-for-leave', function applyForLeave(req, res, next) {

    var newLeave = new Leave();
    newLeave.applicantID = req.user._id;
    newLeave.title = req.body.title;
    newLeave.type = req.body.type;
    newLeave.startDate = new Date(req.body.start_date);
    newLeave.endDate = new Date(req.body.end_date);
    newLeave.period = req.body.period;
    newLeave.reason = req.body.reason;
    newLeave.appliedDate = new Date();
    newLeave.managerResponse = 'Pending';
    newLeave.save(function saveLeave(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/manager/applied-leaves');
    });

});

/**
 * Description:
 * Sets the bonus of the selected employee in UserSalary Schema
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th Novemebr, 2016
 *
 * Known Bugs: None
 */

router.post('/set-bonus', function setBonus(req, res) {

    UserSalary.findOne({employeeID: req.body.employee_bonus}, function getUser(err, us) {
        if (err) {
            console.log(err)
        }
        us.bonus = req.body.bonus;
        us.reason = req.body.reason;
        us.save(function saveUserSalary(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/manager/view-employees')
        })
    })

})

/**
 * Description:
 * Sets the salary of the selected employee in UserSalary Schema
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/set-salary', function setSalary(req, res) {

    var employee_id = req.body.employee_salary;
    UserSalary.findOne({employeeID: employee_id}, function (err, us) {
        if (err) {
            console.log(err)
        }
        console.log(us);
        us.salary = Number(req.body.salary);
        us.save(function setUserSalary(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/manager/view-employees')
        })

    })

})

/**
 * Description:
 * Sets the Incremented salary of the selected employee in UserSalary Schema
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/increment-salary', function incrementSalary(req, res) {

    UserSalary.findOne({employeeID: req.body.employee_increment}, function getUserSalary(err, us) {

        if (err) {
            console.log(err)
        }
        us.salary = Number(req.body.current_salary) + Number(req.body.amount_increment);
        us.save(function saveUserSalary(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/manager/view-employees')
        })
    })

})

/**
 * Description:
 * Saves the performance appraisal of the employee against the employeeID in the PaySlip Schema.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/provide-performance-appraisal', function providePerformanceAppraisal(req, res) {

    var employeeId = req.body.employee_id;
    var newPerformanceAppraisal = new PerformanceAppraisal();
    newPerformanceAppraisal.employeeID = employeeId;
    newPerformanceAppraisal.projectManagerID = req.user._id;
    newPerformanceAppraisal.rating = req.body.performance_rating;
    newPerformanceAppraisal.positionExpertise = req.body.expertise;
    newPerformanceAppraisal.approachTowardsQualityOfWork = req.body.approach_quality;
    newPerformanceAppraisal.approachTowardsQuantityOfWork = req.body.approach_quantity;
    newPerformanceAppraisal.leadershipManagementSkills = req.body.lead_manage;
    newPerformanceAppraisal.communicationSkills = req.body.skills_com;
    newPerformanceAppraisal.commentsOnOverallPerformance = req.body.comments;
    newPerformanceAppraisal.save(function savePerformanceAppraisal(err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/manager/view-employees');

    });
});

/**
 * Description:
 * Stores the Pay Slip of employee in PaySlip schema if  not already stored
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/generate-pay-slip', function generatePaySlip(req, res) {

    var employeeId = req.body.employee_id;
    PaySlip.find({employeeID: employeeId}, function getPaySlip(err, docs) {
        if (err) {
            console.log(err);
        }
        docs[0].bankName = req.body.bname;
        docs[0].branchAddress = req.body.baddress;
        docs[0].basicPay = req.body.pay;
        docs[0].overtime = req.body.otime;
        docs[0].conveyanceAllowance = req.body.allowance;
        docs[0].save(function savePaySlip(err) {
            if (err) {
                console.log(err);
            }
            res.redirect('/manager/view-employees');

        })
    })

});

/**
 * Description:
 * Displays attendance to the manager for the given year and month.
 *
 * Author: Hassan Qureshi
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/view-attendance', function viewAttendance(req, res, next) {

    var attendanceChunks = [];
    Attendance.find({
        employeeID: req.user._id,
        month: req.body.month,
        year: req.body.year
    }).sort({_id: -1}).exec(function getAttendanceSheet(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        for (var i = 0; i < docs.length; i++) {
            attendanceChunks.push(docs[i]);
        }
        res.render('Manager/viewAttendance', {
            title: 'Attendance Sheet',
            month: req.body.month,
            csrfToken: req.csrfToken(),
            found: found,
            attendance: attendanceChunks,
            moment: moment,
            userName: req.session.user.name
        });
    });


});

/**
 * Description:
 * Marks the attendance of the manager in current date
 *
 * Author: Salman Nizam
 *
 * Last Updated: 30th November, 2016
 *
 * Known Bugs: None
 */

router.post('/mark-manager-attendance', function markAttendance(req, res, next) {

    Attendance.find({
        employeeID: req.user._id,
        date: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    }, function getAttendance(err, docs) {
        var found = 0;
        if (docs.length > 0) {
            found = 1;
        }
        else {

            var newAttendance = new Attendance();
            newAttendance.employeeID = req.user._id;
            newAttendance.year = new Date().getFullYear();
            newAttendance.month = new Date().getMonth() + 1;
            newAttendance.date = new Date().getDate();
            newAttendance.present = 1;
            newAttendance.save(function saveAttendance(err) {
                if (err) {
                    console.log(err);
                }

            });
        }
        res.redirect('/manager/view-attendance-current');

    });


});
module.exports = router;



function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}