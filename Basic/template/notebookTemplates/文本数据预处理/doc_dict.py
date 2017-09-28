class DocDict:
    #根据输入的字符串集合构建词典
    def __init__(self,list,segment=None):
        index = 1
        dict = {}
        idict = {}
        for line in list:
            if segment != None:
                lines = line.split(segment)
                for t in lines:
                    if t not in dict:
                        dict[t] = index
                        idict[index] = t
                        index = index + 1
            else:
                if line not in dict:
                    dict[line] = index
                    idict[line] = index
                    index = index + 1
        self.dict = dict
        self.index = idict
        self.size = index - 1
        
    #根据key查找对应的index
    def getIndexByKey(self,key):
        if key in self.dict:
            return self.dict.get(key)
        return 0
    #根据index查找key
    def getKeyByIndex(self,ind):
        if ind in self.index:
            return self.index.get(ind)
        return None
    
    def getIndexByKeyList(self,keys):
        indexs = []
        for k in keys:
            indexs.append( self.getIndexByKey(k) )
        return indexs
    
    def getKeyByIndexs(self, indexs):
        keys = []
        for u in indexs:
            keys.append( self.getKeyByIndex(u) )
        return keys
    
    def length(self):
        return self.size
    