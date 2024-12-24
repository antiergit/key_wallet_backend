import { Router } from "express";

export interface ControllerInterface {
  path: string,
  router: Router,
  initializeRoutes: () => void
}

export interface OnlyControllerInterface {
  initialize: () => void
}