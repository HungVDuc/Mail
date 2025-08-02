import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { MailFilterDto } from './dto/MailFilterDto';
import { SendMailDto } from './dto/SendMailDto';

@Controller('api/v1')
export class MailController {
  private readonly logger = new Logger(MailController.name);
  constructor(private readonly mailService: MailService) {}

  @UseGuards(AuthGuard)
  @Post('send-mail')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            file.originalname +
            '-' +
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async sendMail(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() sendMailDto: SendMailDto,
    @Request() req,
  ) {
    try {
      const messageId = await this.mailService.sendMail(
        sendMailDto,
        req.user,
        files,
      );

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(`Failed to send mail: ${error.message}`, error.stack);
      return { success: false };
    }
  }

  @UseGuards(AuthGuard)
  @Get('inbox')
  async getInbox(@Request() req) {
    try {
      return this.mailService.getInbox(req.user);
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('sent')
  async getSent(@Request() req) {
    try {
      return this.mailService.getSent(req.user);
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('search')
  async searchMail(
    @Query('q') keyword: string,
    @Query() filter: MailFilterDto,
    @Request() req,
  ) {
    try {
      return this.mailService.advancedSearch(req.user, {
        ...filter,
        keyword,
      });
    } catch (error) {
      return error;
    }
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return res.download(`./uploads/${filename}`);
  }
}
