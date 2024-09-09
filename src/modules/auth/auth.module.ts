import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { User } from '../../entities/user.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { LocalStrategy } from './local.strategy';



@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to load environment variables
      inject: [ConfigService], // Inject ConfigService to access the .env variables
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Load secret from .env file
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m') }, // Load expiration time or use '60s' as default
      }),
    }),
    TypeOrmModule.forFeature([User, RefreshToken]), // Ensure UserRepository is available by importing the entity
    UsersModule,
    
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule { }

