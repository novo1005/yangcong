// ---- plugin:voc_doc_parser_1 ----
// ============================================================
// 插件 voc_doc_parser_1 (VOC文档内容解析) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface VocDocParserOneInput {
  /** 飞书妙记导出的VOC文档文件 */
  voc_file: string[];
}

/**
 * capabilityClient.load('voc_doc_parser_1').call<VocDocParserOneOutput>('parseDocToMarkdown', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content } = result;
 */
export interface VocDocParserOneOutput {
  /** [object Object] */
  content: string;
}
// ---- end:voc_doc_parser_1 ----

// ---- plugin:voc_structured_extraction_1 ----
// ============================================================
// 插件 voc_structured_extraction_1 (VOC结构化提取) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface VocStructuredExtractionOneInput {
  /** 待提取结构化VOC数据的文档文本内容 */
  doc_content: string;
}

/**
 * capabilityClient.load('voc_structured_extraction_1').call<VocStructuredExtractionOneOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { vocList } = result;
 */
export interface VocStructuredExtractionOneOutput {
  /** VOC数据列表，items schema: {brand: string(品牌，枚举：洋葱/妙懂、学而思、万物指南、NB虚拟实验室、赛先生), text: string(用户原声文本), respondent: string(受访者ID), sentiment: string(情感倾向，枚举：positive、neutral、negative), dimension: string(所属维度), subDimension: string(子维度)} */
  vocList: unknown[];
}
// ---- end:voc_structured_extraction_1 ----