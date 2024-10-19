import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { AuthUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Wish } from './entities/wish.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @AuthUser() user: User) {
    return this.wishesService.create(createWishDto, user.id);
  }

  @Get('/last')
  getLastWishes(): Promise<Wish[]> {
    return this.wishesService.findLatestWishes();
  }

  @Get('/top')
  getMostCopiedWishes(): Promise<Wish[]> {
    return this.wishesService.findMostCopiedWishes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getWishById(@Param('id') id: string): Promise<Wish> {
    return this.wishesService.findById(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    return this.wishesService.updateOne(id, updateWishDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: number, @AuthUser() user: User) {
    return this.wishesService.removeOne(id, user);
  }

  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copyWish(@Param('id') id: number, @AuthUser() user: User): Promise<Wish> {
    return this.wishesService.copyWish(id, user);
  }
}
