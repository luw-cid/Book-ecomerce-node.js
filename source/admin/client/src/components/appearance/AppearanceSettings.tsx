import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Upload, X, Plus, Edit, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const mockBanners = [
  { id: 1, title: 'Summer Sale Banner', location: 'Homepage Hero', size: '1920x600', active: true },
  { id: 2, title: 'New Arrivals', location: 'Category Page', size: '1200x400', active: true },
  { id: 3, title: 'Holiday Promotion', location: 'Homepage Secondary', size: '800x300', active: false },
];

export function AppearanceSettings() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-1">Appearance & Theme</h2>
        <p className="text-gray-600">Customize your store's look and feel</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="banners">Banner Management</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl mb-4">Website Name</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website-name">Store Name</Label>
                  <Input 
                    id="website-name" 
                    defaultValue="My E-commerce Store"
                    placeholder="Enter your store name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input 
                    id="tagline" 
                    placeholder="Your store's tagline"
                  />
                </div>
                <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                  Update Name
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl mb-4">Logo</h3>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="relative">
                    <ImageWithFallback 
                      src={logoPreview} 
                      alt="Logo preview"
                      className="w-full h-32 object-contain bg-gray-50 rounded-lg p-4"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setLogoPreview(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload your logo</p>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label 
                      htmlFor="logo-upload"
                      className="cursor-pointer text-[#1a4d2e] hover:underline"
                    >
                      Choose file
                    </Label>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Recommended: 300x100px, PNG with transparent background
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl mb-4">Favicon</h3>
              <div className="space-y-4">
                {faviconPreview ? (
                  <div className="relative inline-block">
                    <ImageWithFallback 
                      src={faviconPreview} 
                      alt="Favicon preview"
                      className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setFaviconPreview(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload favicon</p>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <Label 
                      htmlFor="favicon-upload"
                      className="cursor-pointer text-[#1a4d2e] hover:underline"
                    >
                      Choose file
                    </Label>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Recommended: 32x32px or 64x64px, ICO or PNG format
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="banners">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl">Banner List</h3>
              <Button 
                onClick={() => setShowBannerForm(!showBannerForm)} 
                className="bg-[#1a4d2e] hover:bg-[#2d6a4f]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Banner
              </Button>
            </div>

            {showBannerForm && (
              <Card className="p-6">
                <h3 className="text-xl mb-4">Add/Edit Banner</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="banner-title">Banner Title</Label>
                      <Input 
                        id="banner-title" 
                        placeholder="e.g., Summer Sale Banner"
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner-location">Display Location</Label>
                      <Input 
                        id="banner-location" 
                        placeholder="e.g., Homepage Hero"
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner-link">Banner Link (Optional)</Label>
                      <Input 
                        id="banner-link" 
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="banner-width">Width (px)</Label>
                        <Input 
                          id="banner-width" 
                          type="number"
                          defaultValue="1920"
                        />
                      </div>
                      <div>
                        <Label htmlFor="banner-height">Height (px)</Label>
                        <Input 
                          id="banner-height" 
                          type="number"
                          defaultValue="600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Banner Image</Label>
                    {bannerPreview ? (
                      <div className="relative">
                        <ImageWithFallback 
                          src={bannerPreview} 
                          alt="Banner preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setBannerPreview(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Upload banner image</p>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={handleBannerUpload}
                          className="hidden"
                          id="banner-upload"
                        />
                        <Label 
                          htmlFor="banner-upload"
                          className="cursor-pointer text-[#1a4d2e] hover:underline"
                        >
                          Choose file
                        </Label>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload high-quality images for best display. JPG or PNG format.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="mb-2">Preview</h4>
                      {bannerPreview ? (
                        <ImageWithFallback 
                          src={bannerPreview} 
                          alt="Banner preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                          Banner preview will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                    Save Banner
                  </Button>
                  <Button variant="outline" onClick={() => setShowBannerForm(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Size</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBanners.map((banner) => (
                      <tr key={banner.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{banner.title}</td>
                        <td className="py-3 px-4">{banner.location}</td>
                        <td className="py-3 px-4 text-gray-600">{banner.size}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowBannerForm(true)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
