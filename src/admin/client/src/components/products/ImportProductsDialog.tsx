import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileJson, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportProductsDialogProps {
  open: boolean;
  onClose: () => void;
  onImportJSON: (products: any[]) => void;
  onImportExcel: (file: File) => void;
}

export function ImportProductsDialog({ open, onClose, onImportJSON, onImportExcel }: ImportProductsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'json' | 'excel' | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setErrors([]);
    setParsedData([]);

    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'json') {
      setFileType('json');
      parseJSONFile(uploadedFile);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      setFileType('excel');
      parseExcelFile(uploadedFile);
    } else {
      setErrors(['Unsupported file format. Please upload a JSON or Excel file.']);
    }
  };

  const parseJSONFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const products = Array.isArray(json) ? json : [json];
        validateAndSetProducts(products);
      } catch (error) {
        setErrors(['Invalid JSON file. Please check the file format.']);
      }
    };
    reader.readAsText(file);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        validateAndSetProducts(jsonData);
      } catch (error) {
        setErrors(['Error parsing Excel file. Please check the file format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateAndSetProducts = (products: any[]) => {
    const validationErrors: string[] = [];
    const validProducts: any[] = [];

    products.forEach((product, index) => {
      const rowNum = index + 1;
      
      // Required fields validation
      if (!product.name && !product.title && !product.Name && !product.Title) {
        validationErrors.push(`Row ${rowNum}: Missing book title/name`);
      }
      if (!product.price && !product.Price) {
        validationErrors.push(`Row ${rowNum}: Missing price`);
      }
      if (!product.description && !product.Description) {
        validationErrors.push(`Row ${rowNum}: Missing description`);
      }

      // Normalize field names to match backend schema
      const normalizedProduct = {
        name: product.name || product.title || product.Name || product.Title || '',
        author: product.author || product.Author || '',
        publisher: product.publisher || product.Publisher || '',
        description: product.description || product.Description || '',
        price: parseFloat(product.price || product.Price || 0),
        originalPrice: parseFloat(product.originalPrice || product.OriginalPrice || 0),
        stock: parseInt(product.stock || product.Stock || product.quantity || product.Quantity || 0),
        category: product.category || product.Category || product.categoryId || '',
        images: product.images 
          ? (Array.isArray(product.images) ? product.images : [product.images])
          : (product.image ? [product.image] : []),
        tags: product.tags 
          ? (Array.isArray(product.tags) ? product.tags : product.tags.split(',').map((t: string) => t.trim()))
          : [],
        isNewProduct: product.isNewProduct === true || product.isNewProduct === 'true' || product.isNewProduct === 'Có',
        isBestSeller: product.isBestSeller === true || product.isBestSeller === 'true' || product.isBestSeller === 'Có',
        isFlashSale: product.isFlashSale === true || product.isFlashSale === 'true' || product.isFlashSale === 'Có',
        isActive: product.isActive !== false && product.isActive !== 'false' && product.isActive !== 'Không',
      };

      validProducts.push(normalizedProduct);
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    }

    if (validProducts.length > 0) {
      setParsedData(validProducts);
      setStep('preview');
    }
  };

  const handleImport = () => {
    if (fileType === 'json') {
      // Gọi onImportJSON với parsed data
      onImportJSON(parsedData);
    } else if (fileType === 'excel' && file) {
      // Gọi onImportExcel với file gốc
      onImportExcel(file);
    }
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setFileType(null);
    setParsedData([]);
    setErrors([]);
    setStep('upload');
    onClose();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products from File</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-[#1a4d2e] bg-green-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2">Drag and drop your file here, or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Supports JSON and Excel (.xlsx, .xls) files</p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#1a4d2e] hover:bg-[#2d6a4f]"
              >
                Choose File
              </Button>
            </div>

            {file && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                  <br />
                  Type: <strong>{fileType?.toUpperCase()}</strong>
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="mb-2">Errors found:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <p className="font-medium">Expected File Format:</p>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileJson className="w-5 h-5 text-[#1a4d2e] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">JSON Format:</p>
                    <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
{`[
  {
    "name": "Đắc Nhân Tâm",
    "author": "Dale Carnegie",
    "publisher": "NXB Trẻ",
    "description": "Sách về kỹ năng giao tiếp",
    "price": 120000,
    "originalPrice": 150000,
    "stock": 100,
    "category": "category_id_here",
    "images": ["url1.jpg", "url2.jpg"],
    "tags": ["self-help", "communication"],
    "isNewProduct": true,
    "isBestSeller": false,
    "isFlashSale": false
  }
]`}
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#1a4d2e] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Excel Format:</p>
                    <div className="bg-white p-2 rounded mt-1 text-xs">
                      <p className="mb-2">Required columns:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li><strong>name</strong> - Tên sách (bắt buộc)</li>
                        <li><strong>author</strong> - Tác giả (bắt buộc)</li>
                        <li><strong>description</strong> - Mô tả (bắt buộc)</li>
                        <li><strong>price</strong> - Giá bán (bắt buộc)</li>
                        <li><strong>stock</strong> - Số lượng tồn kho (bắt buộc)</li>
                        <li><strong>category</strong> - ID danh mục (bắt buộc)</li>
                        <li><strong>publisher</strong> - Nhà xuất bản</li>
                        <li><strong>originalPrice</strong> - Giá gốc</li>
                        <li><strong>images</strong> - URLs (phân cách bởi dấu phẩy)</li>
                        <li><strong>tags</strong> - Tags (phân cách bởi dấu phẩy)</li>
                        <li><strong>isNewProduct</strong> - Sản phẩm mới (Có/Không)</li>
                        <li><strong>isBestSeller</strong> - Bán chạy (Có/Không)</li>
                        <li><strong>isFlashSale</strong> - Flash sale (Có/Không)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Found <strong>{parsedData.length}</strong> product(s) ready to import
                {fileType === 'excel' && (
                  <div className="mt-2 text-sm">
                    <strong>Note:</strong> For Excel files, the original file will be sent to server for processing.
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="mb-2">Validation warnings ({errors.length}):</p>
                  <ul className="list-disc list-inside space-y-1 text-sm max-h-32 overflow-y-auto">
                    {errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {errors.length > 10 && <li>... and {errors.length - 10} more warnings</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 border-b">Name</th>
                      <th className="text-left py-2 px-3 border-b">Author</th>
                      <th className="text-left py-2 px-3 border-b">Publisher</th>
                      <th className="text-left py-2 px-3 border-b">Price</th>
                      <th className="text-left py-2 px-3 border-b">Stock</th>
                      <th className="text-left py-2 px-3 border-b">Category</th>
                      <th className="text-left py-2 px-3 border-b">Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{product.name}</td>
                        <td className="py-2 px-3">{product.author}</td>
                        <td className="py-2 px-3">{product.publisher || '-'}</td>
                        <td className="py-2 px-3">
                          ${product.price}
                          {product.originalPrice > 0 && (
                            <span className="text-xs text-gray-500 line-through ml-1">
                              ${product.originalPrice}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">{product.stock}</td>
                        <td className="py-2 px-3 text-xs">{product.category}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1 flex-wrap">
                            {product.isNewProduct && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">New</span>
                            )}
                            {product.isBestSeller && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Best</span>
                            )}
                            {product.isFlashSale && (
                              <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Sale</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <div className="bg-gray-50 py-2 px-3 text-sm text-gray-600 border-t">
                  Showing first 10 of {parsedData.length} products
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'preview' && (
            <Button
              variant="outline"
              onClick={() => {
                setStep('upload');
                setFile(null);
                setFileType(null);
                setParsedData([]);
                setErrors([]);
              }}
            >
              Choose Different File
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'preview' && parsedData.length > 0 && (
            <Button
              onClick={handleImport}
              className="bg-[#1a4d2e] hover:bg-[#2d6a4f]"
            >
              Import {parsedData.length} Product(s)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
