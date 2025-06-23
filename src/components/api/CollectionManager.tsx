
import React, { useState } from 'react';
import { ApiRequest, ApiCollection } from './PostmanInterface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Folder, FileText, Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CollectionManagerProps {
  collections: ApiCollection[];
  onCollectionsChange: (collections: ApiCollection[]) => void;
  onRequestSelect: (request: ApiRequest) => void;
  activeRequest: ApiRequest | null;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  collections,
  onCollectionsChange,
  onRequestSelect,
  activeRequest
}) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const newCollection: ApiCollection = {
      id: Date.now().toString(),
      name: newCollectionName,
      requests: []
    };
    
    onCollectionsChange([...collections, newCollection]);
    setNewCollectionName('');
    setIsDialogOpen(false);
    
    toast({
      title: "Collection créée",
      description: `La collection "${newCollectionName}" a été créée`,
    });
  };

  const addRequestToCollection = (collectionId: string, request: ApiRequest) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: [...collection.requests, { ...request, id: Date.now().toString() }]
        };
      }
      return collection;
    });
    onCollectionsChange(updatedCollections);
    
    toast({
      title: "Requête ajoutée",
      description: "La requête a été ajoutée à la collection",
    });
  };

  const removeRequest = (collectionId: string, requestId: string) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: collection.requests.filter(req => req.id !== requestId)
        };
      }
      return collection;
    });
    onCollectionsChange(updatedCollections);
  };

  const exportCollection = (collection: ApiCollection) => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${collection.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Collection exportée",
      description: `La collection a été exportée en JSON`,
    });
  };

  const importCollection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const collection = JSON.parse(e.target?.result as string);
        collection.id = Date.now().toString(); // New ID to avoid conflicts
        onCollectionsChange([...collections, collection]);
        
        toast({
          title: "Collection importée",
          description: `La collection "${collection.name}" a été importée`,
        });
      } catch (error) {
        toast({
          title: "Erreur d'importation",
          description: "Le fichier JSON n'est pas valide",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const deleteCollection = (collectionId: string) => {
    const updatedCollections = collections.filter(c => c.id !== collectionId);
    onCollectionsChange(updatedCollections);
    
    toast({
      title: "Collection supprimée",
      description: "La collection a été supprimée",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Collections d'APIs</h3>
        <div className="flex space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={importCollection}
              className="hidden"
            />
            <div className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2 text-sm">
              <Upload className="w-4 h-4" />
              <span>Importer</span>
            </div>
          </label>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nom de la collection"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createCollection()}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createCollection}>
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {activeRequest && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Ajouter la requête actuelle à une collection:</h4>
          <div className="flex flex-wrap gap-2">
            {collections.map(collection => (
              <Button
                key={collection.id}
                size="sm"
                variant="outline"
                onClick={() => addRequestToCollection(collection.id, activeRequest)}
              >
                <Folder className="w-4 h-4 mr-1" />
                {collection.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium">{collection.name}</h4>
                <span className="text-sm text-gray-500">({collection.requests.length} requêtes)</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportCollection(collection)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteCollection(collection.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {collection.requests.map(request => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => onRequestSelect(request)}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{request.name}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {request.method}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRequest(collection.id, request.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Aucune collection créée</p>
          <p className="text-sm">Créez votre première collection pour organiser vos APIs</p>
        </div>
      )}
    </div>
  );
};
