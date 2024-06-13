import usersService from '../services/user.service'
import {Request, Response} from "express";

const getAllUsers = async (req: Request, res: Response) => {
    const allUsers = await usersService.findAllUsers()
    return res.json(allUsers)
}

const getUserById = async (req: Request, res: Response) => {
    const {id} = req.params
    const user = await usersService.findOneUserById(id)
    return res.json(user)
}

const createUser = async (req: Request, res: Response) => {
    const {body} = req
    try {
        const registeredUser = await usersService.createUser(body)
        return res.json(registeredUser)
    } catch (error) {
        return res.status(500).json(error)
    }
}

const updateUser = async (req: Request, res: Response) => {
    const {id} = req.params
    const {body} = req
    try {
        const updatedUser = await usersService.updateUserById(id, body)
        return res.json(updatedUser)
    } catch (error) {
        return res.status(500).json(error)
    }
}

const deleteUser = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const deletedUser = await usersService.deleteUser(id)
        return res.json(deletedUser)
    } catch (error) {
        return res.status(500).json(error)
    }
}

const usersController = {getAllUsers, getUserById, createUser, updateUser, deleteUser}

export default usersController
