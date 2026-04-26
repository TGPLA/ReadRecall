import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { databaseService } from '@shared/services/database'

const 测试用户ID = 'test-user-' + Date.now()
const 测试书籍列表: string[] = []

const 测试服务器地址 = 'https://linyubo.top'

function 模拟Fetch响应(数据: unknown, 状态码 = 200) {
  return Promise.resolve({
    ok: 状态码 >= 200 && 状态码 < 300,
    status: 状态码,
    text: () => Promise.resolve(JSON.stringify(数据)),
    json: () => Promise.resolve(数据),
  } as Response)
}

describe('书籍管理功能测试', () => {
  beforeAll(() => {
    databaseService.setUserId(测试用户ID)
  })

  afterAll(async () => {
    for (const 书籍ID of 测试书籍列表) {
      try {
        await fetch(`${测试服务器地址}/api/books/${书籍ID}`, { method: 'DELETE' })
      } catch {
        // 忽略删除失败的情况
      }
    }
  })

  describe('创建书籍', () => {
    it('应该成功创建一本新书', async () => {
      const 测试书籍 = {
        title: '测试书籍_' + Date.now(),
        author: '测试作者',
        description: '这是一本测试书籍',
        questionCount: 0,
        masteredCount: 0
      }

      const 模拟响应数据 = {
        success: true,
        data: {
          id: 'test-book-' + Date.now(),
          user_id: 测试用户ID,
          title: 测试书籍.title,
          author: 测试书籍.author,
          chapter_count: 0,
          question_count: 0,
          mastered_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(模拟响应数据, 201))

      const { book, error } = await databaseService.createBook(测试书籍)

      expect(error).toBeNull()
      expect(book).not.toBeNull()
      expect(book?.title).toBe(测试书籍.title)
      expect(book?.author).toBe(测试书籍.author)

      if (book?.id) {
        测试书籍列表.push(book.id)
      }
    })

    it('缺少标题时应该返回错误', async () => {
      const 无效书籍 = {
        title: '',
        author: '测试作者',
        questionCount: 0,
        masteredCount: 0
      }

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(
        { message: '标题不能为空' },
        400
      ))

      const { book, error } = await databaseService.createBook(无效书籍)

      expect(book).toBeNull()
      expect(error).not.toBeNull()
    })
  })

  describe('获取书籍列表', () => {
    it('应该成功获取书籍列表', async () => {
      const 模拟书籍列表 = [
        {
          id: 'book-1',
          userId: 测试用户ID,
          title: '书籍1',
          author: '作者1',
          questionCount: 5,
          masteredCount: 2,
          createdAt: Date.now()
        },
        {
          id: 'book-2',
          userId: 测试用户ID,
          title: '书籍2',
          author: '作者2',
          questionCount: 3,
          masteredCount: 1,
          createdAt: Date.now()
        }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应({ success: true, data: 模拟书籍列表 }))

      const { books, error } = await databaseService.getAllBooks()

      expect(error).toBeNull()
      expect(books).toHaveLength(2)
      expect(books[0].title).toBe('书籍1')
    })

    it('未登录时应该返回错误', async () => {
      databaseService.setUserId('')
      
      const { books, error } = await databaseService.getAllBooks()

      expect(error).not.toBeNull()
      expect(error?.message).toBe('用户未登录')
      expect(books).toHaveLength(0)

      databaseService.setUserId(测试用户ID)
    })
  })

  describe('更新书籍', () => {
    it('应该成功更新书籍信息', async () => {
      const 书籍ID = 'test-book-update'
      const 更新数据 = {
        title: '更新后的标题',
        author: '更新后的作者'
      }

      const 模拟响应数据 = {
        success: true,
        data: {
          id: 书籍ID,
          user_id: 测试用户ID,
          title: 更新数据.title,
          author: 更新数据.author,
          chapter_count: 0,
          question_count: 0,
          mastered_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(模拟响应数据))

      const { book, error } = await databaseService.updateBook(书籍ID, 更新数据)

      expect(error).toBeNull()
      expect(book).not.toBeNull()
      expect(book?.title).toBe(更新数据.title)
      expect(book?.author).toBe(更新数据.author)
    })

    it('更新不存在的书籍应该返回错误', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(
        { message: '书籍不存在' },
        404
      ))

      const { book, error } = await databaseService.updateBook('不存在的ID', { title: '新标题' })

      expect(book).toBeNull()
      expect(error).not.toBeNull()
    })
  })

  describe('删除书籍', () => {
    it('应该成功删除书籍', async () => {
      const 书籍ID = 'test-book-delete'

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(null, 204))

      const { error } = await databaseService.deleteBook(书籍ID)

      expect(error).toBeNull()
    })

    it('删除不存在的书籍应该返回错误', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(
        { message: '书籍不存在' },
        404
      ))

      const { error } = await databaseService.deleteBook('不存在的ID')

      expect(error).not.toBeNull()
    })
  })
})

describe('题目管理功能测试', () => {
  const 测试书籍ID = 'test-book-for-questions'

  beforeAll(() => {
    databaseService.setUserId(测试用户ID)
  })

  describe('获取题目列表', () => {
    it('应该成功获取指定书籍的题目列表', async () => {
      const 模拟题目列表 = [
        {
          id: 'q-1',
          bookId: 测试书籍ID,
          userId: 测试用户ID,
          question: '什么是测试？',
          answer: '测试是验证功能的过程',
          questionType: '简答题',
          difficulty: '基础',
          masteryLevel: '未掌握',
          category: 'standard',
          practiceCount: 0,
          createdAt: Date.now()
        }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应({ success: true, data: 模拟题目列表 }))

      const { questions, error } = await databaseService.getQuestionsByBook(测试书籍ID)

      expect(error).toBeNull()
      expect(questions).toHaveLength(1)
      expect(questions[0].question).toBe('什么是测试？')
    })
  })

  describe('创建题目', () => {
    it('应该成功创建新题目', async () => {
      const 测试题目 = {
        bookId: 测试书籍ID,
        question: '新题目',
        answer: '新答案',
        questionType: '简答题' as const,
        difficulty: '基础' as const,
        masteryLevel: '未掌握' as const,
        category: 'standard' as const,
        practiceCount: 0
      }

      const 模拟响应数据 = {
        id: 'q-new',
        ...测试题目,
        createdAt: Date.now()
      }

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(模拟响应数据, 201))

      const { question, error } = await databaseService.createQuestion(测试题目)

      expect(error).toBeNull()
      expect(question).not.toBeNull()
      expect(question?.question).toBe('新题目')
    })
  })

  describe('更新题目', () => {
    it('应该成功更新题目', async () => {
      const 题目ID = 'q-update'
      const 更新数据 = {
        masteryLevel: '已掌握' as const
      }

      const 模拟响应数据 = {
        id: 题目ID,
        bookId: 测试书籍ID,
        userId: 测试用户ID,
        question: '题目内容',
        answer: '答案',
        questionType: '简答题',
        difficulty: '基础',
        masteryLevel: 更新数据.masteryLevel,
        category: 'standard',
        practiceCount: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(模拟响应数据))

      const { question, error } = await databaseService.updateQuestion(题目ID, 更新数据)

      expect(error).toBeNull()
      expect(question?.masteryLevel).toBe('已掌握')
    })
  })

  describe('删除题目', () => {
    it('应该成功删除题目', async () => {
      const 题目ID = 'q-delete'

      global.fetch = vi.fn().mockResolvedValueOnce(模拟Fetch响应(null, 204))

      const { error } = await databaseService.deleteQuestion(题目ID)

      expect(error).toBeNull()
    })
  })
})
