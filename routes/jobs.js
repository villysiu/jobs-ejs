const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
  jobForm,
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob

  
} = require("../controllers/jobs");

router.route('/').get(getJobs)
                  .post(createJob);
router.get('/new', jobForm)
router.get('/edit/:id', jobForm)
router.get('/delete/:id', deleteJob)

router.route("/:id").get(getJob).post(updateJob)
// .delete(deleteJob)


module.exports = router;