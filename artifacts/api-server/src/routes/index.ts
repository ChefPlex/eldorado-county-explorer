import { Router, type IRouter } from "express";
import healthRouter from "./health";
import markersRouter from "./markers";
import openaiRouter from "./openai/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(markersRouter);
router.use(openaiRouter);

export default router;
