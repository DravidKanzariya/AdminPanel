import { Router } from "express";
import { addUser, authAdmin, deleteUser, getAdmins, getCurrentUser, getTrainers, getUsers, updateUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(verifyJWT,authAdmin)
router.route("/add-user").post(verifyJWT, addUser);
router.route("/update-user/:id").patch(verifyJWT, updateUser);

router.route("/delete-user/:id").delete(verifyJWT, deleteUser);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);
router.route("/get-users").get(verifyJWT, getUsers);
router.route("/get-trainers").get(verifyJWT, getTrainers);
router.route("/get-admins").get(verifyJWT, getAdmins);


export default router;
