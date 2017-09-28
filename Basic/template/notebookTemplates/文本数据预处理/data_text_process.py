import os
import pandas as pd
import ipywidgets as widgets
from ipywidgets import Layout
from IPython.display import display
from time import sleep
import jieba
import numpy as np
import copy

from sklearn.feature_extraction.text import CountVectorizer,TfidfVectorizer
from sklearn.feature_extraction import DictVectorizer

from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

from doc_dict import DocDict

import pickle
from scipy.sparse import hstack,csr_matrix


#文本特征权值表示方式：0/1 、 出现次数、tf-idf、词频
wt = ['binary','count','tfidf','freq']

#获取词典
def getDicWords(dicPath,encoding='UTF-8'):
    fl = open(dicPath,'r',encoding=encoding )
    words = fl.readlines()
    fl.close()
    return set( [w.strip() for w in words] )

stop = []
#getDicWords('../data/stopword.txt')

class ConfSet(object):
    '''
    预处理配置参数以及输出路径
    '''
    def __init__(self):
        
        wt = ['binary','count','tfidf','freq']
        #文本特征权值表示方式
        self.weight_type = wt[0]
        
        #文本n-gram文法特征n取值
        self.weight_gram = 1
        #输出路径
        self.save_path = '../data/'
        
    def value_change(self,change):
        if change.name == 'type':
            self.weight_type = change['new']
        elif change.name == 'gram':
            self.weight_gram = change['new']
        elif change.name == 'path':
            self.save_path = change['new']
    
    def widgets(self):
        slider = widgets.IntSlider(
                value=1,
                min=1,
                max=5,
                step=1,
                disabled=False,
                continuous_update=False,
                orientation='horizontal',
                readout=True,
                readout_format='i',
                slider_color='white',
                name = 'gram'
            )
        self.weight_gram = slider.value
        
        slider.observe(self.value_change,names='value' )
        
        title = widgets.Label("文本特征处理配置")
        
        weight_type = widgets.HBox([widgets.Label("特征权值："),widgets.Dropdown(options=wt, name='type')])
        weight_type.children[1].observe(self.value_change, names='value')
        
        weight_gram = widgets.HBox([widgets.Label("N-gram特征："),slider])
        
        path_wid =  widgets.Text(value=self.save_path,placeholder='请输入输出路径',description='输出路径：',disabled=False, name='path')
        path_wid.observe(self.value_change, names='value')
        
        self.widget = widgets.VBox([title,weight_type,weight_gram,path_wid])
        
        return (self.widget)

    
def wordCloudGenerate(text):
    stopwords = set(STOPWORDS | stop)
    font = FontProperties(fname="../data/simsun.ttf", size=28)  
    wc = WordCloud(max_words=200, stopwords=stopwords, margin=20,font_path='../data/simsun.ttf',collocations=False,
                   random_state=1).generate( text )
    # store default colored image
    default_colors = wc.to_array()

    plt.figure(figsize=[20,20])

    plt.title("工单词云分布", fontproperties=font)
    plt.imshow(default_colors, interpolation="bilinear")
    plt.axis("off")

    plt.show()
    
    
#特征以及分类标签字段选择，会根据选择对做相应的处理
pm ={'请选择':0, '分类标签':1, '分词处理':2, '离散型数据':3, '连续型数据':4}

class DataProcess(object):
    
    def __init__(self, file_path=None, label_dic =None, text_feat = None, struct_feat = None):
        
        self.df = None
        if file_path != None:
            self.df = pd.read_csv(file_path, low_memory=False)
        #文本特征
        self.tf = text_feat
        #结构化数据特征
        self.st = struct_feat
        #label标签字段转换
        self.label_dict = label_dic
        
        self.conf = ConfSet()
        
        self.cl_items = []
        
        self.train_array = None
        self.train_label = None
        
        self.einfo = None
    
    def process_save(self, path):
        '''
        特征以及分类标签处理方式保存供后续处理调用
        '''
        if self.einfo != None:
            print (self.einfo)
            return
        tf = []
        if self.tf != None:
            for cl,t in self.tf:
                ct = copy.copy(t)
                ct.tokenizer = None
                tf.append((cl,ct))
        param = [self.label_dict,tf,self.st]
        ft = open(path, 'wb')
        pickle.dump( param ,ft,True)
        ft.close()
    
    @staticmethod
    def load_process(path):
        '''
        加载特征、分类标签字段的处理方式
        '''
        ft = open(path, 'rb')
        param = pickle.load(ft)
        ft.close()
        tf = param[1]
        for cl,t in tf:
            t.tokenizer = jieba.cut
        return( DataProcess(label_dic =param[0], text_feat = param[1], struct_feat = param[2]) )
        
    def app_button_clicked(self,b):
        '''
        对选择的特征字段根据选择的处理方式处理生成特征one-hot字典
        多个文本特征会分别做分词，每个字段单独生成特征词典
        对于离散、连续型结构化数据统一一个字典处理
        '''
        label = None
        
        featSelect = False
        
        #判断分类标签字段以及特征字段是否选择正确，分类标签字段只能选择一个，特征字段不能少于一个
        for i in range(0, len(self.df.columns) ):
            cname = self.df.columns[i]
            select = self.cl_items[i].value
            if select == 1 and label != None:
                self.einfo = '标签字段只能选择一个'
                return
            elif select == 1 and label == None:
                label = cname
            elif select>=2:
                featSelect = True
        if featSelect == False:
            self.einfo = '特征字段请至少选择一个'
            return
            
        train_ft = {}
        self.tf = []
        
        struct = []
        
        segFile = pd.DataFrame()
        
        textForWordCloud = []
        
        for i in range(0, len(self.df.columns) ):
            cname = self.df.columns[i]
            select = self.cl_items[i].value
            if select == 2:
                vect = self.text_process_vect()
#                train_ft.append( vect.fit_transform( self.df[cname] ).toarray() )
                #先分词
                textToken = [u" ".join(list(jieba.cut(v))) for v in  self.df[cname] ]
    
                textForWordCloud = textForWordCloud + textToken
                #生成特征向量
                train_ft[cname] = vect.fit_transform( textToken )
                self.tf.append( (cname, vect) )
                #demo数据
                segFile[cname] = self.df[cname][:10]
                segFile["%s_seg"%cname] = textToken[:10]
                segFile["%s_feature_words"%cname] = [" ".join(list(v)) for v in vect.inverse_transform( train_ft[cname][:10] ) ]
                
            elif select == 3 :
                self.df[ cname ] = self.df[ cname ].astype('category')
                struct.append(cname)
            elif select == 4 :
                self.df[ cname ] = self.df[ cname ].astype('float32') 
                struct.append(cname)
        
        ###对离散、连续型数据统一字典处理
        if len(struct) > 0 :
            st = self.df[ struct ]
            vect = DictVectorizer()
#            train_ft.append( vect.fit_transform(st.to_dict(orient='records') ).toarray() ) 
            train_ft['struct'] = vect.fit_transform(st.to_dict(orient='records') )
            self.st = vect
        else:
            self.st = None
            
        llist = self.df[ label ].astype('category').tolist()
        self.label_dict= ( label,DocDict( llist ) )
        
#        if len(train_ft) > 0:
##            self.train_array = np.concatenate((train_ft), axis=1)
#            self.train_array = hstack(train_ft)
#        else:
#            self.train_array = train_ft[0]
#            
#        self.train_label = np.asarray( self.label_dict[1].getIndexByKeyList(llist) )
        
        train_label = csr_matrix( np.asarray( self.label_dict[1].getIndexByKeyList(llist) ) ).T
        train_ft[label] = train_label
        self.train_ft = train_ft
        
        self.textForWordCloud = textForWordCloud
        wordCloudGenerate(" ".join(textForWordCloud) )
        
        if len( segFile ) > 0:
            display( widgets.HTML( segFile.to_html() ) )
        
    def save_model_data(self,b):
        path = './'
        if self.conf.save_path != None:
            path = self.conf.save_path
            if path.endswith('/') == False:
                path = "%s/"%(path)
        
        ft = open('%strain_data.pkl'%(path), 'wb')
        pickle.dump( self.train_ft ,ft,True)
        ft.close()
        
        self.process_save( "%smodel.pkl"%(path) )
        
    def transform(self,raw_data):
        '''
        输入数据根据文本、结构化数据的特征字典进行one-hot编码，缺失特征默认为0
        input:
            raw_data:待处理的输入数据，数据格式为Dataframe，列名需要与训练数据一致
        return：
            one-hot型特征表示
        '''
        test_array = {}
        if self.tf != None:
            for (cl,vect) in self.tf:
                if cl not in raw_data.columns:
                    #test_array.append( np.zeros([len(raw_data), len(vect.vocabulary_)] ) )
                    test_array[cl] = csr_matrix((len(raw_data), len(vect.vocabulary_)),dtype=np.float )
                    continue
                raw = raw_data[cl]
                test_array.append( vect.transform( raw ).toarray() )
        if self.st != None:
            struct = self.st.transform( raw_data.to_dict(orient='records') )
            test_array['struct'] = struct
            
        label = None
        if self.label_dict[0] in raw_data.columns:
            llist = raw_data[ self.label_dict[0] ].astype('category').tolist()
            label = csr_matrix( np.asarray( self.label_dict[1].getIndexByKeyList(llist) ) ).T
        else:
            label = csr_matrix((len(raw_data),1), dtype=np.int )
        test_array[self.label_dict[0]] = label
        return( test_array )

    def text_process_vect(self):
        #根据文本特征抽取配置参数生成特征词典，分词采用结巴分词器
        weight_type = self.conf.weight_type
        weight_gram = self.conf.weight_gram
        
        if weight_type == wt[0]:
            text_vect = CountVectorizer(min_df=0.001,max_df=0.8, binary=True,ngram_range=(1, weight_gram), tokenizer = jieba.cut, stop_words = stop)
        elif weight_type == wt[1]:
            text_vect = CountVectorizer(min_df=0.001,max_df=0.8, binary=False,ngram_range=(1, weight_gram), tokenizer = jieba.cut, stop_words = stop)
        elif weight_type == wt[2]:
            text_vect = TfidfVectorizer(min_df=0.001,max_df=0.8, binary=False,ngram_range=(1, weight_gram), tokenizer = jieba.cut, stop_words = stop)
        else:
            text_vect = TfidfVectorizer(min_df=0.001,max_df=0.8, binary=True,ngram_range=(1, weight_gram), tokenizer = jieba.cut, stop_words = stop)
        
        return(text_vect)

    def process_widget(self):
        '''
        文本以及结构化特征处理与配置页面demo
        '''
        columns = self.df.columns
        vb_items = []
        title = [widgets.Label("字段名称", layout=Layout(width='33%')), 
                 widgets.Label("数据类型", layout=Layout(width='33%')), 
                 widgets.Label("处理方式", layout=Layout(width='33%'))]

        vb_items.append(widgets.HBox(title) )

        for var_name in columns:
            des = self.df[var_name].describe()
            op = 0
            if 'mean' in des.keys():
                op = 4
            elif 'unique' in des.keys():
                len = self.df[var_name].str.len().describe()
                if des['unique'] > des['count']*0.8 and len['mean'] > 32:
                    op = 2
            
            drop = widgets.Dropdown(options=pm, layout=Layout(width='33%'), value=op)
            
            hb_items = [widgets.Label(var_name, layout=Layout(width='33%')),
                        widgets.Label( str(self.df[var_name].dtype), layout=Layout(width='33%')),  
                        drop ]
            self.cl_items.append(drop)
            
            vb_items.append(widgets.HBox(hb_items))

        vb_items.append(self.conf.widgets())
        
        app = widgets.Button(description='应用')
        app.on_click(self.app_button_clicked)

        save = widgets.Button(description='保存')
        save.on_click(self.save_model_data)
        
        #vb_items.append(app)
        vb_items.append(widgets.HBox([app,save]))
        
        dwidget = widgets.VBox(vb_items)
        
        return(dwidget)
