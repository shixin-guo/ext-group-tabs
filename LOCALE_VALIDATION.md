# 多语言验证工具

这个项目现在支持全球使用量前9的语言：

1. **英语 (en)** - 默认语言
2. **中文 (zh)** - 简体中文
3. **印地语 (hi)** - Hindi
4. **西班牙语 (es)** - Español
5. **法语 (fr)** - Français
6. **阿拉伯语 (ar)** - العربية
7. **孟加拉语 (bn)** - বাংলা
8. **葡萄牙语 (pt)** - Português
9. **俄语 (ru)** - Русский

## 验证脚本使用说明

项目包含一个验证脚本 `validate-locales.js`，用于检查所有语言包的JSON键是否完全一致。

### 基本用法

```bash
# 验证所有语言包
node validate-locales.js

# 显示所有键的完整列表
node validate-locales.js --show-keys

# 检查特定键在所有语言包中的存在情况
node validate-locales.js --check-key "options_title"

# 显示帮助信息
node validate-locales.js --help
```

### 验证结果示例

```
🔍 开始验证语言包...

✅ 加载语言包: en (26 个键)
✅ 加载语言包: ru (26 个键)
✅ 加载语言包: zh (26 个键)
✅ 加载语言包: hi (26 个键)
✅ 加载语言包: es (26 个键)
✅ 加载语言包: fr (26 个键)
✅ 加载语言包: ar (26 个键)
✅ 加载语言包: bn (26 个键)
✅ 加载语言包: pt (26 个键)

📊 总共发现 26 个唯一键

✅ 验证成功: 所有语言包的键都完全匹配!
```

### 验证脚本功能

1. **键完整性检查**: 确保所有语言包都包含相同的键
2. **缺失键检测**: 识别哪些语言包缺少特定的键
3. **多余键检测**: 识别哪些语言包包含不应该存在的键
4. **详细报告**: 提供清晰的错误报告和修复建议

### 文件结构

```
_locales/
├── en/messages.json    # 英语 (默认)
├── ru/messages.json    # 俄语
├── zh/messages.json    # 中文
├── hi/messages.json    # 印地语
├── es/messages.json    # 西班牙语
├── fr/messages.json    # 法语
├── ar/messages.json    # 阿拉伯语
├── bn/messages.json    # 孟加拉语
└── pt/messages.json    # 葡萄牙语
```

### 添加新语言

1. 在 `_locales` 目录下创建新的语言文件夹
2. 创建 `messages.json` 文件，包含所有必需的键
3. 运行验证脚本确保键的一致性
4. 更新 `supportedLocales` 数组（在验证脚本中）

### 注意事项

- 所有语言包必须包含完全相同的键结构
- 键名区分大小写
- 嵌套对象使用点号分隔（如 `options_title.message`）
- 验证脚本会自动检测JSON格式错误
