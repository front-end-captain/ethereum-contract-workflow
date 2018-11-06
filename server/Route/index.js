const Router = require("koa-router");
const project = require("./../Controller/Project.js");
const payment = require("./../Controller/Payment.js");
const user = require("./../Controller/User.js");
const router = new Router({ prefix: "/" });

router.get('projects', project.projectsList);
router.get('projects/:address', project.projectDetail);
router.put('project', project.createProject);
router.put('payment', payment.createPayment);
router.post('payment/approve', payment.approvePayment);
router.post('payment/finish', payment.finishPayment);
router.get('user/nonce/:publicAddress', user.getNonce);
router.post('user/auth', user.auth);
router.post('user/register', user.register);

module.exports = router;
