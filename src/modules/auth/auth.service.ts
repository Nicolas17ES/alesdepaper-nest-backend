import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from 'src/entities/refresh-token.entity'; // Import your refresh token entity
import { Request } from 'express';
import { JwtPayload } from 'src/types/types';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) { }

    async validateUser(email: string, password: string): Promise<Partial<User>> {

        try {

            const user = await this.userRepository.findOne({ where: { email: email } });

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            if (!user) {
                throw new UnauthorizedException();
            }

            const { password: _, ...userWithoutPassword } = user;

            return userWithoutPassword;

        } catch(error) {

            this.logger.error(
                `Error validating user`,
                error.stack,
                "Error custom:", error
            );

            throw new InternalServerErrorException();
        }
    }
    

    async generateRefreshToken(user: User): Promise<string> {

        try {

            const refreshToken = new RefreshToken();
            
            refreshToken.user = user;

            refreshToken.token = await this.jwtService.signAsync(
                { userId: user.id },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: '7d',
                },
            );

            await this.refreshTokenRepository.save(refreshToken);

            return refreshToken.token;

        } catch (error) {


            this.logger.error(
                `Error generating refresh token`,
                error.stack,
                "Error custom:", error
            );
            throw new InternalServerErrorException('Failed to generate refresh token');

        }
    }

    async refreshToken(req: Request) {

        const refreshToken = req.cookies['refresh_token']; // Read token from HttpOnly cookie
        if (!refreshToken) throw new UnauthorizedException('No refresh token provided');
        // Find the refresh token along with the associated user
        
        try {

            const token = await this.refreshTokenRepository.createQueryBuilder('refreshToken')
                .leftJoinAndSelect('refreshToken.user', 'user')
                .where('refreshToken.token = :token', { token: refreshToken })
                .select([
                    'refreshToken.id',
                    'refreshToken.token',
                    'user.id',
                    'user.username',
                    'user.email'
                ]) // Explicitly select fields you need
                .getOne();

            if (!token) throw new UnauthorizedException('Invalid refresh token');

            const user = token.user;
            if (!user) throw new UnauthorizedException('User not found');

            const payload: JwtPayload = {
                sub: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            const newAccessToken = this.jwtService.sign(payload);
            return { access_token: newAccessToken };

        } catch (error) {


            this.logger.error(
                `Error generating refresh token`,
                error.stack,
                "Error custom:", error
            );
            throw new InternalServerErrorException('Failed to generate refresh token');

        }
    }
}
