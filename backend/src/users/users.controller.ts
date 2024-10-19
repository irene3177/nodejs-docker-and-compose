import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { EntityNotFoundFilter } from '../common/filters/entity-not-found-exception.filter';
import { Wish } from '../wishes/entities/wish.entity';
import { FindUserDto } from './dto/find-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  async findOwn(@AuthUser() user: User): Promise<User> {
    return this.usersService.findOne({
      where: { id: user.id },
      select: {
        email: true,
        username: true,
        id: true,
        avatar: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  @Patch('me')
  @UseFilters(EntityNotFoundFilter)
  async updateOne(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { id } = user;
    return this.usersService.updateOne(id, updateUserDto);
  }

  @Get('me/wishes')
  findUserWishes(@AuthUser() user: User): Promise<Wish[]> {
    return this.usersService.findUserWishes(user);
  }

  @Get(':username')
  findUserByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }

  @Get(':username/wishes')
  findWishesByUsername(@Param('username') username: string): Promise<Wish[]> {
    return this.usersService.findAllUserWishes(username);
  }

  @Post('find')
  async findUsers(@Body() findUserDto: FindUserDto): Promise<User[]> {
    return this.usersService.findByUsernameOrEmail(findUserDto.query);
  }
}
