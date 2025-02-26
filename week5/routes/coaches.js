const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coaches')

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

router.get('/', async (req, res, next) => {
  try {
     // 驗證 per & page 是否為有效數字
     if (!isValidString(per) || !isValidString(page) || !isNumber(per) || !isNumber(page)) {
        return res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
      }
  
      per = parseInt(per, 10)
      page = parseInt(page, 10)
  
      if (per <= 0 || page <= 0) {
        return res.status(400).json({
          status: 'failed',
          message: 'per 和 page 需為正整數'
        })
      }
  
      const coachesRepository = dataSource.getRepository('Coaches')
  
      // 取得教練列表
      const [coaches, total] = await coachesRepository.findAndCount({
        select: {
          id: true,
          name: true,
        },
        take: per,
        skip: (page - 1) * per,
      })
  
      res.status(200).json({
        status: 'success',
        data: coaches,
        total,
        page,
        per,
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  })
  
  router.get('/:coachId', async (req, res, next) => {
    try {
      const { coachId } = req.params
      if(!isValidString(coachId)) {
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }

      const result = await dataSource.getRepository('Coaches').find({
        select: ['id', 'user_id', 'experience_years', 'description', 'profile_image_url', 'created_at',  'updated_at'] ,
        where: { id: coachId }
      })
  
      if (result.length === 0) {
        res.status(400).json({
          status: 'failed',
          message: '找不到該教練'
        })
        return
      }
  
      const coachesRepository = dataSource.getRepository('Coaches')
      const coachesInfo = await coachesRepository.findOne({
        select: ['name', 'role'],
        where: { id: result[0].user_id }
      })
      res.status(200).json({
        status: 'success',
        data: {
          user: coachesInfo,
          coaches: result[0]
        }
      })

    } catch (error) {
      logger.error(error)
      next(error)
    }
  })


  module.exports = router