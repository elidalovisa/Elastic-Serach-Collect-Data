/**
 * API version 1 routes.
 *
 * @author Elida Arrechea
 * @version 1.0.0
 */

import express from 'express'
import { Controller } from '../index.mjs'
export const router = express.Router()

const controller = new Controller()

 router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!' }))

 router.get('/index', (req, res, next) => controller.go(req, res, next))

 

