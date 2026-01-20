/**
 * Mock API 配置文件
 * 定义所有的 Mock 端点
 */

import type { EndpointConfig } from './plugins/ai-mock-generator/types';

/**
 * Mock 端点配置
 */
export const mockEndpoints: EndpointConfig[] = [
  // ==================== 用户相关 ====================
  
  // 用户列表
  {
    path: '/api/users',
    method: 'GET',
    response: {
      name: 'User',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', comment: '用户名' },
        { name: 'email', type: 'string', comment: '邮箱地址' },
        { name: 'age', type: 'number', comment: '年龄', constraints: { min: 18, max: 60 } },
        { name: 'avatar', type: 'string', comment: '头像URL' },
        { name: 'phone', type: 'string', comment: '手机号' },
        { name: 'address', type: 'string', comment: '地址' },
        { 
          name: 'role', 
          type: 'string', 
          comment: '角色',
          constraints: { enum: ['admin', 'user', 'guest'] }
        },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: true,
    },
    count: 20,
  },

  // 用户详情
  {
    path: '/api/users/:id',
    method: 'GET',
    response: {
      name: 'User',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', comment: '用户名' },
        { name: 'email', type: 'string', comment: '邮箱地址' },
        { name: 'age', type: 'number', comment: '年龄' },
        { name: 'avatar', type: 'string', comment: '头像URL' },
        { name: 'phone', type: 'string', comment: '手机号' },
        { name: 'address', type: 'string', comment: '地址' },
        { name: 'role', type: 'string', comment: '角色' },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: false,
    },
  },

  // ==================== 商品相关 ====================
  
  // 商品列表
  {
    path: '/api/products',
    method: 'GET',
    response: {
      name: 'Product',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', comment: '商品名称' },
        { name: 'price', type: 'number', comment: '价格', constraints: { min: 0, max: 10000 } },
        { name: 'category', type: 'string', comment: '分类' },
        { name: 'stock', type: 'number', comment: '库存', constraints: { min: 0, max: 1000 } },
        { name: 'rating', type: 'number', comment: '评分', constraints: { min: 0, max: 5 } },
        { name: 'image', type: 'string', comment: '商品图片' },
        { name: 'description', type: 'string', comment: '商品描述' },
      ],
      isArray: true,
    },
    count: 30,
  },

  // 商品详情
  {
    path: '/api/products/:id',
    method: 'GET',
    response: {
      name: 'Product',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string', comment: '商品名称' },
        { name: 'price', type: 'number', comment: '价格' },
        { name: 'category', type: 'string', comment: '分类' },
        { name: 'stock', type: 'number', comment: '库存' },
        { name: 'rating', type: 'number', comment: '评分' },
        { name: 'image', type: 'string', comment: '商品图片' },
        { name: 'description', type: 'string', comment: '商品描述' },
        { name: 'sales', type: 'number', comment: '销量' },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: false,
    },
  },

  // ==================== 订单相关 ====================
  
  // 订单列表
  {
    path: '/api/orders',
    method: 'GET',
    response: {
      name: 'Order',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'orderNo', type: 'string', comment: '订单号' },
        { name: 'userId', type: 'number', comment: '用户ID' },
        { name: 'amount', type: 'number', comment: '订单金额', constraints: { min: 0, max: 100000 } },
        { 
          name: 'status', 
          type: 'string', 
          comment: '订单状态',
          constraints: { enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'] }
        },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: true,
    },
    count: 25,
  },

  // 订单详情
  {
    path: '/api/orders/:id',
    method: 'GET',
    response: {
      name: 'Order',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'orderNo', type: 'string', comment: '订单号' },
        { name: 'userId', type: 'number', comment: '用户ID' },
        { name: 'amount', type: 'number', comment: '订单金额' },
        { name: 'status', type: 'string', comment: '订单状态' },
        { name: 'items', type: 'string', comment: '订单商品' },
        { name: 'address', type: 'string', comment: '收货地址' },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: false,
    },
  },
  {
    path: '/api/news',
    method: 'GET',
    response: {
      name: 'News',
      properties: [
        { name: 'id', type: 'number' },
        { name: 'title', type: 'string', comment: '新闻名称' },
        { name: 'content', type: 'string', comment: '新闻内容' },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: false,
    },
  },
  {
    path: '/api/news/:id',
    method: 'GET',
    response: {
      name: 'News',
      properties: [
         { name: 'id', type: 'number' },
        { name: 'title', type: 'string', comment: '新闻名称' },
        { name: 'content', type: 'string', comment: '新闻内容' },
        { name: 'createdAt', type: 'Date', comment: '创建时间' },
      ],
      isArray: false,
    },
  },
];

/**
 * 导出默认配置
 */
export default mockEndpoints;
