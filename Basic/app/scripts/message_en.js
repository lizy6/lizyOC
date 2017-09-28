'use strict';
/**
 * Resource file for en g18n
 */
angular.module('basic').config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('en', {
    'web_common_000': 'OCAI',
    'web_common_001': 'Data Application',
    'web_common_002': 'Data Explore',
    'web_common_003': 'Task Schedule',
    'web_common_004': 'Knowledge Map',
    'web_common_005': 'Settings',
    'web_common_006': 'Add',
    'web_common_007': 'My data explore',
    'web_common_008': 'Structural data',
    'web_common_009': 'Next',
    'web_common_010': 'User name',
    'web_common_011': 'Password',
    'web_common_012': 'Sign in',
    'web_common_013': 'Sign out',
    'web_common_014': 'Username or password is wrong, please re-enter',
    'web_common_015': 'Create new',
    'web_common_016': 'Back',
    'web_common_017': 'Preview',
    'web_common_018': 'Save',
    'web_common_019': 'Open my',
    'web_common_020': 'Data Dictionary',
    'web_common_021': 'Copy',

    'web_common_data_explore_001': 'Data Source',
    'web_common_data_explore_002': 'Data Report',
    'web_common_data_explore_003': 'Data Processing',
    'web_common_data_explore_004': 'Data datamation demo',
    'web_common_data_explore_005': 'Default data source Data source',
    'web_common_data_explore_005_02': '(CDM interface) configured with parameter settings',
    'web_common_data_explore_006': 'Data file import',
    'web_common_data_explore_007': 'Import',
    'web_common_data_explore_008': 'Data preview',
    'web_common_data_explore_009': 'High relevance variable to weight (check the deleted variable)',
    'web_common_data_explore_010': 'Variable null processing',
    'web_common_data_explore_011': 'Variable regularization',
    'web_common_data_explore_012': 'Apply',

    'web_common_data_explore_013': 'Data application search',
    'web_common_data_explore_014': 'Text preprocessing',
    'web_common_data_explore_015': 'Classification prediction',
    'web_common_data_explore_016': 'Data intelligence grouping',
    'web_common_data_explore_017': 'Target Detection',
    'web_common_data_explore_018': 'Expert model',
    'web_common_data_explore_019': 'Create my data to explore',
    'web_common_data_explore_020': 'Open new data to explore',
    'web_common_data_explore_021': 'Headline',


    'web_common_explore_013':'File uploaded',

    'modelType_00':'My data explores',
    'modelType_01':'Structured data exploration',
    'modelType_02':'Text data preprocessing',
    'modelType_03':'Classification prediction',
    'modelType_04':'Cluster analysis',
    'modelType_05':'Target Detection',
    'modelType_06':'Expert model',

    'modelType_01_00':'Number of category variables:',
    'modelType_01_01':'Number of variables(columns number):',
    'modelType_01_02':'Null ratio:',
    'modelType_01_03':'Number of numeric variables:',
    'modelType_01_04':'Number of rows:',
    'modelType_01_05':'Last execution time:',

    'modelType_02_00':'N-gram:',
    'modelType_02_01':'The number of vocabulary:',
    'modelType_02_02':'Number of features:',
    'modelType_02_03':'Weight:',

    'modelType_03_00':'True rate:',
    'modelType_03_01':'Recall rate:',
    'modelType_03_02':'F1 value:',

    'modelType_04_00':'Number of groups:',
    'modelType_04_01':'Data label:',

    'modelType_05_00':'N-gram:',
    'modelType_05_01':'The number of vocabulary:',
    'modelType_05_02':'Number of features:',
    'modelType_05_03':'Weight:',

    'web_common_data_app_01': 'Data application search',
    'web_common_data_app_02': 'My data application',
    'web_common_data_app_03': 'Data application',
    'web_common_data_app_04': 'Universal data applications',
    'web_common_data_app_05': 'Application file',
    'web_common_data_app_06': 'Task plan',
    'web_common_data_app_07': 'Run the choreography',
    'web_common_data_app_08': 'Operation result',
    'web_common_data_app_09': 'Application preview',
    'web_common_data_app_result_00': 'Task: Loss of user warning',
    'web_common_data_app_result_01': 'Task: Customer clustering',



    'web_common_data_app_layer_01': 'Create my data application',
    'web_common_data_app_layer_02': 'Open a new data application',
    'web_common_data_app_layer_03': 'Create',
    'web_common_data_app_layer_04': 'Create an analysis framework',
    'web_common_data_app_layer_05': 'Name',

    'web_common_data_delete_layer_00': 'Delete message',
    'web_common_data_delete_layer_01': 'Are you sure you want to delete this information?',
    'web_common_data_delete_layer_02': 'confirm',
    'web_common_data_delete_layer_03': 'cancle',

    'web_common_copy_layer_01': 'Copy the file',

    'web_common_expertPart_layer_01': 'Creata new ipynb',
    'web_common_expertPart_layer_02': 'Enter a notebook name',
    'web_common_expertPart_layer_03': 'Operating environment selection',
    'web_common_expertPart_layer_04': 'The name needs to be unique'



  });
}]);
