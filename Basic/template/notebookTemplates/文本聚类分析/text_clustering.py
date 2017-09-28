import jieba
import pandas as pd
import numpy as np
import scipy.cluster.hierarchy as hac
import matplotlib.pyplot as plt
import networkx as nx

from matplotlib import rcParams
from string import digits,punctuation,whitespace
from scipy.cluster.hierarchy import fcluster

def set_ch():
    rcParams['font.family'] = 'sans-serif'
    rcParams['font.sans-serif'] = \
        ['Heiti SC',
         'Heiti TC',
         'STHeiti',
         'WenQuanYi Zen Hei',
         'WenQuanYi Micro Hei',
         "文泉驿微米黑",
         'SimHei'] + rcParams['font.sans-serif']
    rcParams['axes.unicode_minus'] = False

def explore_stop_words(items, count=50):

    word_list=[]
    
    for term in items:
        word_list.extend(list(jieba.cut(term)))
    
    unique, counts = np.unique(word_list, return_counts=True)
    operation_term_df=pd.DataFrame(np.asarray((unique, counts)).T, columns=['term','freq'])
    operation_term_df['freq']=operation_term_df[['freq']].apply(pd.to_numeric)
    operation_term_df = operation_term_df.sort_values(by='freq', ascending=False).head(count)
    operation_term_df.set_index(['term'],inplace=True)
    operation_term_df.freq.plot(kind='bar',logy=True,figsize=(18,5))
    
class text_clustering(object):
    
    def __init__(self, items, stopwords):
        self.stopwords = stopwords
        self.items = items

    def stringTranslateTerm(self, s):
        s=s.translate(str.maketrans('', '', '()（）&/:!@#$%^&*_+-={}[]\|;<>,.?/`~]'+punctuation+whitespace+digits))
        return set(jieba.cut(s)).difference(self.stopwords)
    
    def stringTranslateLetter(self, s):
        return s.translate(str.maketrans('', '', '()（）&/:!@#$%^&*_+-={}[]\|;<>,.?/`~]'+punctuation+whitespace+digits))
    
    def dfun(self, u, v):
        
        u1=self.stringTranslateTerm(u)
        v1=self.stringTranslateTerm(v)
        il = len(set(u1).intersection(set(v1)))   
        termDistance=(1 - il/max(len(set(u1)),len(set(v1))))
        
        u2=self.stringTranslateLetter(u)
        v2=self.stringTranslateLetter(v)
        il = len(set(u2).intersection(set(v2)))   
        letterDistance=(1 - il/max(len(set(u2)),len(set(v2))))
        
        return(termDistance+letterDistance)/2
    
    def minDistance(self, u, v):
        min = 1;
        for i in range(0, len(u)-1):
            if (min>u[i]) & (min>v[i]):
                min=(u[i]+v[i])/2
                
        return min
    
    def hierarchy_clustering(self):

        ol_len=len(self.items)
        
        result_list=[]
        distance_matrix=np.zeros((ol_len-1, ol_len-1))
        for i in range(0, ol_len-1):
            for j in range(i+1, ol_len-1):
                distance_matrix[i,j]=self.dfun(self.items[i],self.items[j])
                distance_matrix[j,i]=distance_matrix[i,j]
                if i!=j:
                    result_list.append([distance_matrix[i,j],self.items[i],self.items[j]])
          
        # Do the clustering
        self.Z = hac.linkage(distance_matrix,method='complete',metric=self.minDistance)
        
        plt.figure(figsize=(18, 6))
        plt.title('层次聚类图示')
        plt.xlabel('收费项目编号')
        plt.ylabel('距离')
        hac.dendrogram(
            self.Z,
            truncate_mode='lastp',  # show only the last p merged clusters
            p=300,  # show only the last p merged clusters
            leaf_rotation=90.,  # rotates the x axis labels
            leaf_font_size=18.,  # font size for the x axis labels
        )
        plt.show()
    
    def get_clustering_result(self, threshold=0.3):
        
        cluster_result=[]
        cluster=fcluster(self.Z, threshold, criterion='distance')
        for i in range(0, len(cluster)-1):          
            cluster_result.append([cluster[i],self.items[i]])
            
        cluster_df=pd.DataFrame(cluster_result, columns=['cluster_id','item'])
        cluster_df_gb=cluster_df.groupby('cluster_id').count()
        cluster_index=cluster_df_gb[cluster_df_gb['item']>1].sort_values(by='item', ascending=False).index.values

        print(cluster_df_gb[cluster_df_gb['item']>1]['item'].sum())
        print(len(self.items))
        print(len(set(cluster_index)))
        
        G = nx.Graph()
        
        for i in cluster_index:
            c_i = cluster_df[cluster_df['cluster_id']==i]['item'].values
            for j in range(0,len(c_i)):
                G.add_edge(c_i[0], c_i[j])
                
        return G



