import { Router } from "express";
import { login, register, refreshToken, logout } from "./auth.controller";
import { validateLogin, validateRegister } from "./auth.validators";
import { authenticate } from "../../core/middleware/auth.middleware";

const router = Router();

router.post("/login", validateLogin, login);
router.post("/register", authenticate, validateRegister, register); // Admin only
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logout);

export default router;
