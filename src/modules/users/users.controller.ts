import { Body, Controller, Post, Get, UsePipes, ValidationPipe, UseGuards, Request, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dto/CreateUser.dto';
import { LoginUserDto } from '../../dto/LoginUser.dto';
import { JwtPayload } from '../../types/types';
import { UsersService } from './users.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { Response } from 'express'; // Import Response from 'express'


export interface RequestWithUser extends Request {
  user: JwtPayload;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    // Manually handle the response
    await this.usersService.register(createUserDto, res);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() loginUserDto: LoginUserDto, @Request() req: AuthenticatedRequest, @Res() res: Response) {
    // Manually handle the response
    return await this.usersService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  getUser(@Request() req: RequestWithUser): JwtPayload  {
    return req.user;
  }
}

