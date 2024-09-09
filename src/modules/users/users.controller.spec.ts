import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Response } from 'express'; // Import Response from express

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    register: jest.fn(async (dto, res) => {
      // Simulate the call to res.json with the expected access token
      return res.json({
        access_token: 'mocked_access_token'
      });
    }),
  };

  const mockAuthService = {};

  // Mock the Response object
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.json = jest.fn().mockReturnValue(res); // Mock res.json() method
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, AuthService],
    })
      .overrideProvider(UsersService).useValue(mockUsersService)
      .overrideProvider(AuthService).useValue(mockAuthService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const mockRes = mockResponse(); // Mocked response

    // Call the controller method and await its execution
    await controller.register({
      email: 'nico@gmail.com',
      username: 'nicolaidis',
      password: 'tete',
    }, mockRes as Response);

    // Ensure that res.json was called with the correct token
    expect(mockRes.json).toHaveBeenCalledWith({
      access_token: 'mocked_access_token',
    });
  });
});
