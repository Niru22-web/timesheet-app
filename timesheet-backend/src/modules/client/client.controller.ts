import { Request, Response } from 'express';
import { ClientService } from './client.service';
import multer from 'multer';
import * as XLSX from 'xlsx';

const clientService = new ClientService();

// Configure multer for Excel file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientService.getClientById(id);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(400).json({ error: error.message || 'Failed to create client' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientService.updateClient(id, req.body);
    res.json(client);
  } catch (error: any) {
    console.error('Error updating client:', error);
    res.status(400).json({ error: error.message || 'Failed to update client' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await clientService.deleteClient(id);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting client:', error);
    res.status(400).json({ error: error.message || 'Failed to delete client' });
  }
};

export const bulkUploadClients = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate required columns
    const requiredColumns = ['name', 'alias', 'gstStatus', 'pan'];
    const firstRow = jsonData[0] as any;
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required columns',
        missingColumns,
        requiredColumns: ['name', 'alias', 'address', 'pin', 'state', 'country', 'gstStatus', 'gstin', 'pan', 'clientId']
      });
    }

    // Process bulk creation
    const results = await clientService.bulkCreateClients(jsonData);
    
    res.json({
      message: 'Bulk upload completed',
      totalRecords: jsonData.length,
      successCount: results.success.length,
      errorCount: results.errors.length,
      results
    });
  } catch (error: any) {
    console.error('Error in bulk upload:', error);
    res.status(400).json({ error: error.message || 'Failed to process bulk upload' });
  }
};

export const downloadClientTemplate = async (req: Request, res: Response) => {
  try {
    // Create template data
    const templateData = [
      {
        name: 'Example Company Pvt Ltd',
        alias: 'ECL',
        address: '123 Business Park, Andheri East',
        pin: '400069',
        state: 'Maharashtra',
        country: 'India',
        gstStatus: 'Yes',
        gstin: '27AAAPL1234C1ZV',
        pan: 'AAAPL1234C',
        clientId: 'CL123456' // Optional - will be auto-generated if empty
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=client_upload_template.xlsx');

    // Write buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
};

// Middleware for file upload
export const uploadClientFile = upload.single('file');