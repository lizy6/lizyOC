'use strict';
/**
 * Resource file for en g18n
 */
angular.module('basic').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('zh', {
    'web_common_000': 'OCAI',
    'web_common_001': '数据应用',
    'web_common_002': '数据探索',
    'web_common_003': '任务计划',
    'web_common_004': '知识图谱',
    'web_common_005': '系统设置',
    'web_common_006': '添加应用',
    'web_common_007': '我的数据探索',
    'web_common_008': '结构化数据探索',
    'web_common_009': '下一步',
    'web_common_010': '用户名',
    'web_common_011': '密码',
    'web_common_012': '登录',
    'web_common_013': '退出',
    'web_common_014': '用户名或密码错误,请重新输入',
    'web_common_015': '创建',
    'web_common_016': '上一步',
    'web_common_017': '预览',
    'web_common_018': '保存',
    'web_common_019': '开启我的',
    'web_common_020': '数据字典',
    'web_common_021': '复制',


    'web_common_data_explore_001': '数据选择',
    'web_common_data_explore_002': '数据探索',
    'web_common_data_explore_003': '数据预处理建议',
    'web_common_data_explore_004': '结构化数据探索',
    'web_common_data_explore_005': '默认数据源',
    'web_common_data_explore_005_02': '通过参数设置配置的数据源(CDM接口)',
    'web_common_data_explore_006': '数据文件导入',
    'web_common_data_explore_007': '上传',
    'web_common_data_explore_008': '数据预览',
    'web_common_data_explore_009': '高关联性变量去重(请勾选删除的变量)',
    'web_common_data_explore_010': '变量空值处理',
    'web_common_data_explore_011': '变量正则化',
    'web_common_data_explore_012': '应用',

    'web_common_data_explore_013': '数据应用搜索',
    'web_common_data_explore_014': '文本预处理',
    'web_common_data_explore_015': '分类预测',
    'web_common_data_explore_016': '数据智能分组',
    'web_common_data_explore_017': '目标检测',
    'web_common_data_explore_018': '专家模式',
    'web_common_data_explore_019': '创建我的数据探索',
    'web_common_data_explore_020': '开启新的数据探索',
    'web_common_data_explore_021': '标题',

    'web_common_explore_013':' File uploaded',

    'modelType_00':'我的数据探索',
    'modelType_01':'结构化数据探索',
    'modelType_02':'文本数据预处理',
    'modelType_03':'分类预测',
    'modelType_04':'聚类分析',
    'modelType_05':'目标检测',
    'modelType_06':'专家模式',

    'modelType_01_00':'类别型变量数:',
    'modelType_01_01':'变量数(列数):',
    'modelType_01_02':'空值比例:',
    'modelType_01_03':'数值型变量数:',
    'modelType_01_04':'行数:',
    'modelType_01_05':'上次执行时间:',

    'modelType_02_00':'N-gram:',
    'modelType_02_01':'词汇数:',
    'modelType_02_02':'特征数:',
    'modelType_02_03':'权值:',

    'modelType_03_00':'准确率:',
    'modelType_03_01':'召回率:',
    'modelType_03_02':'F1 值:',

    'modelType_04_00':'分组数:',
    'modelType_04_01':'数据标签:',

    'modelType_05_00':'N-gram:',
    'modelType_05_01':'词汇数:',
    'modelType_05_02':'特征数:',
    'modelType_05_03':'权值:',

    'web_common_data_app_01': '数据应用搜索',
    'web_common_data_app_02': '我的数据应用',
    'web_common_data_app_03': '数据应用',
    'web_common_data_app_04': '通用数据应用',
    'web_common_data_app_05': '应用文件',
    'web_common_data_app_06': '任务计划',
    'web_common_data_app_07': '运行编排',
    'web_common_data_app_08': '运行结果',
    'web_common_data_app_09': '应用概览',
    'web_common_data_app_result_00': '任务: 流失用户预警',
    'web_common_data_app_result_01': '任务: 客户分群',

    'web_common_data_app_layer_01': '创建我的数据应用',
    'web_common_data_app_layer_02': '新的数据应用',
    'web_common_data_app_layer_03': '创建',
    'web_common_data_app_layer_04': '创建分析框架',
    'web_common_data_app_layer_05': '名字',

    'web_common_data_delete_layer_00': '删除信息',
    'web_common_data_delete_layer_01': '确认要删除此信息吗',
    'web_common_data_delete_layer_02': '确认',
    'web_common_data_delete_layer_03': '取消',

    'web_common_copy_layer_01': '文件复制',

    'web_common_expertPart_layer_01': '创建新的ipynb',
    'web_common_expertPart_layer_02': '输入notebook名称:',
    'web_common_expertPart_layer_03': '运行环境选择:',
    'web_common_expertPart_layer_04': '名称需要唯一'

  });
}]);
