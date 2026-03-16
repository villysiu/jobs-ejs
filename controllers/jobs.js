const Job = require('../models/Job');
const parseVErr = require("../util/parseValidationErr");
const csrf = require("host-csrf");


const getJobs = async (req, res) => {
    // console.log("get all jobs ")
    const { _id: userId } = req.user;
    const token = csrf.refreshToken(req, res);
   
    const jobs = await Job.find({ createdBy: userId });

    res.render("jobs", { jobs, csrfToken: token });

}
const getJob = async (req, res) => {
    // console.log("get single job")
    const {_id: userId} = req.user;
    const {id: jobId} = req.params
    const token = csrf.refreshToken(req, res);
   
    const job = await Job.findOne({
        createdBy: userId,
        _id: jobId
    });

    res.render("jobs", {jobs: [job], csrfToken: token});

}
const createJob = async (req, res) => {

    const {_id: userId} = req.user;
    // const {company, position, status} = req.body;
    const job = await Job.create({
        ...req.body,
        createdBy: req.user._id
    })

    req.flash("info", "New job created.");
    res.redirect("/jobs");
}

const updateJob = async (req, res) => {
    console.log("update")
    const {_id: userId} = req.user;
    const { id: jobId } = req.params;

    const {company, position, status} = req.body;

    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId
    }) 
    if(!job)
        req.flash("error", "Job not found.");
    else{
        job.company = company;
        job.position = position;
        job.status = status;
        await job.save();
        req.flash("info", "Job updated.");

    }
    
    return res.redirect("/jobs");
}
const deleteJob = async (req, res) => {
    console.log('delete')
    const { _id: userId } = req.user
    const { id: jobId } = req.params

    const job = await Job.findOneAndDelete({
        _id: jobId,
        createdBy: userId,
    })
    if (!job) {
        req.flash("error", "Job not found.");
    }
    else{
        req.flash("info", "Job deleted.");
    }
    
    res.redirect("/jobs");
}

const jobForm = async (req, res) => {
    const token = csrf.refreshToken(req, res);
    // console.log(token)

    const { id: jobId} = req.params;
    const { _id: userId } = req.user;


    if(jobId === undefined){
        return res.render("jobForm", { job: null, csrfToken: token })
    } 
    
    const job = await Job.findOne({ createdBy: userId, _id: jobId });
    
    if(!job){
        req.flash("error", "Job not found.");
        return res.redirect("/jobs"); 
    }
    
    res.render("jobForm", { job, csrfToken: token })

    
}
module.exports = {
  createJob,
  deleteJob,
  getJobs,
  updateJob,
  getJob,
  jobForm
}