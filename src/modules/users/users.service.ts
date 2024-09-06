import { Injectable, BadRequestException, InternalServerErrorException, Logger  } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../../dto/CreateUser.dto';
import * as bcrypt from 'bcrypt'; 
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/modules/auth/auth.service';
import { Response } from 'express'; // Import Response from 'express'
import { JwtPayload } from 'src/types/types';


@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
    ) { }

    async register(createUserDto: CreateUserDto, res: Response) {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        const user: Partial<User> = {
            email: createUserDto.email,
            username: createUserDto.username,
            password: hashedPassword,
            role: this.configService.get<string>('USER_ROLE')
        }

        try {
            // Save user to the database
            const savedUser: User = await this.userRepository.save(user);

            // Payload for JWT token
            const payload: JwtPayload = {
                sub: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            };

            // Generate access token
            const access_token = this.jwtService.sign(payload);

            const refresh_token = await this.authService.generateRefreshToken(savedUser);

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Set secure flag in production
                sameSite: 'strict',
            });

            res.json({ access_token });

        } catch (error) {
            this.logger.error(
                `Error registering user:`,
                error.stack,
                "Error custom:", error
            );
            // Handle errors
            if (error.code === '23505') { // Assuming 23505 is a unique constraint violation code
                throw new BadRequestException('User already exists');
            } else {
                throw new InternalServerErrorException('Failed to register user');
            }
        }
    }


    async login(user: User, res: Response) {
        try {
            const payload: JwtPayload = {
                sub: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            const access_token = this.jwtService.sign(payload);
            const refresh_token = await this.authService.generateRefreshToken(user);

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.json({ access_token });
             // Send response manually
        } catch (error) {
            this.logger.error(
                `Error login user:`,
                error.stack,
                "Error custom:", error
            );
            throw new InternalServerErrorException('Failed to login');
        }
    }
}
