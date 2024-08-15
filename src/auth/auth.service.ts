import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException, MessagePattern } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';


import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

    constructor(
        private readonly jwtService: JwtService,
    ) {
        super();
    }

    private readonly logger = new Logger('AuthService')
    onModuleInit() {
        this.$connect();
        this.logger.log('MongoDB connected')
    }

    async signJWT(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }

    async verifyToken(token: string) {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.jwtSecret,
            })

            return {
                user: user,
                token: await this.signJWT(user),
            }

        } catch (error) {
            console.log(error);
            throw new RpcException({  // RpcException only microservices to propagate error from microservice to api-gateway
                status: 401,
                message: 'Invalid token'
            })
        }
    }


    async registerUser(registerUserDto: RegisterUserDto) {

        const { email, name, password } = registerUserDto;
        try {
            const user = await this.user.findUnique({
                where: {
                    email: email,
                }
            })

            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                })
            }
            const newUser = await this.user.create({
                data: {
                    email: email,
                    password: bcrypt.hashSync(password, 10),
                    name: name,
                }
            })

            const { password: _, ...rest } = newUser;

            return {
                user: rest,
                token: await this.signJWT(rest)
            }
        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            })
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {

        const { email, password } = loginUserDto;
        try {
            const user = await this.user.findUnique({
                where: {
                    email: email,
                }
            })

            if (!user) {
                throw new RpcException({ // this is as far as we go
                    status: 400,
                    message: 'User/Password not valid - email' // if it failed by email in depurate
                })
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password)

            if (!isPasswordValid) {
                throw new RpcException({
                    status: 400,
                    message: 'User/Password not valid'
                })
            }

            const { password: _, ...rest } = user;

            return {
                user: rest,
                token: await this.signJWT(rest)
            }
        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            })
        }
    }



}
