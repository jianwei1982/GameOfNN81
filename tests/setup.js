/**
 * Jest测试环境设置文件
 */

// 模拟DOM环境
global.document = document;
global.window = window;

// 模拟console方法以避免测试输出干扰
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
};

// 设置测试超时时间
jest.setTimeout(10000);

// 在每个测试前重置DOM
beforeEach(() => {
    document.body.innerHTML = '';
    
    // 重置所有mock
    jest.clearAllMocks();
});

// 全局测试工具函数
global.createMockElement = (tag, attributes = {}) => {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });
    return element;
};

global.createMockButton = (text, dataset = {}) => {
    const button = document.createElement('button');
    button.textContent = text;
    Object.keys(dataset).forEach(key => {
        button.dataset[key] = dataset[key];
    });
    return button;
};