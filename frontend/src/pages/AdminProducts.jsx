import { useState, useEffect } from 'react';
import { productService } from '../utils/api';
import { 
  Box, Button, Card, CardContent, CardMedia, Container, Dialog,
  DialogActions, DialogContent, DialogTitle, Grid, IconButton,
  TextField, Typography, MenuItem, FormControl, InputLabel, Select,
  Snackbar, Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '', productId: '', description: '', price: '',
    discount: '', type: '', category: '', sizes: [], stock: '',
    images: []
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '', productId: '', description: '', price: '',
    discount: 0, type: 'Men', category: '', sizes: [],
    stock: 0, images: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      setProducts(response.data.data);
    } catch (error) {
      showAlert('Error fetching products', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      productId: product.productId,
      description: product.description,
      price: product.price,
      discount: product.discount,
      type: product.type,
      category: product.category,
      sizes: product.sizes,
      stock: product.stock,
      images: []
    });
    setOpenDialog(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach(image => form.append('images', image));
        } else if (key === 'sizes') {
          // Convert sizes array to string before appending
          form.append('sizes', formData.sizes.join(','));
        } else {
          form.append(key, formData[key]);
        }
      });

      await productService.update(editProduct.productId, form);
      setOpenDialog(false);
      showAlert('Product updated successfully', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Update error:', error);
      showAlert('Error updating product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await productService.delete(deleteId);
      setOpenDeleteDialog(false);
      showAlert('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      showAlert('Error deleting product', 'error');
    }
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(createFormData).forEach(key => {
        if (key === 'images') {
          createFormData.images.forEach(image => form.append('images', image));
        } else if (key === 'sizes') {
          form.append('sizes', createFormData.sizes.join(','));
        } else {
          form.append(key, createFormData[key]);
        }
      });

      await productService.create(form);
      setOpenCreateDialog(false);
      setCreateFormData({
        name: '', productId: '', description: '', price: '',
        discount: 0, type: 'Men', category: '', sizes: [],
        stock: 0, images: []
      });
      showAlert('Product created successfully', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Creation error:', error);
      showAlert('Error creating product', 'error');
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manage Products
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateDialog(true)}
        >
          Create New Product
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.images[0]}
                alt={product.name}
              />
              <CardContent>
                <Typography variant="h6" noWrap>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {product.productId}
                </Typography>
                <Typography>₹{product.price}</Typography>
                {product.discount > 0 && (
                  <Typography color="error">
                    Discount: ₹{product.discount} | Final Price: ₹{product.sellingPrice}
                  </Typography>
                )}
                <Typography variant="body2">Stock: {product.stock}</Typography>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <IconButton onClick={() => handleEdit(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {
                      setDeleteId(product.productId);
                      setOpenDeleteDialog(true);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Product ID"
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="Men">Men</MenuItem>
                    <MenuItem value="Women">Women</MenuItem>
                    <MenuItem value="Kids">Kids</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="Sherwani">Sherwani</MenuItem>
                    <MenuItem value="Kurta">Kurta</MenuItem>
                    <MenuItem value="Lehenga">Lehenga</MenuItem>
                    <MenuItem value="Saree">Saree</MenuItem>
                    <MenuItem value="Pajama">Pajama</MenuItem>
                    <MenuItem value="Indo-Western">Indo-Western</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sizes</InputLabel>
                  <Select
                    multiple
                    value={formData.sizes || []}
                    label="Sizes"
                    onChange={(e) => {
                      const selectedSizes = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        sizes: Array.isArray(selectedSizes) ? selectedSizes : []
                      }));
                    }}
                  >
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="L">L</MenuItem>
                    <MenuItem value="XL">XL</MenuItem>
                    <MenuItem value="Free Size">Free Size</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Price"
                  value={formData.price}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const discount = Number(formData.discount || 0);
                    setFormData(prev => ({
                      ...prev,
                      price,
                      sellingPrice: price - discount
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount"
                  value={formData.discount}
                  onChange={(e) => {
                    const discount = Number(e.target.value);
                    const price = Number(formData.price);
                    setFormData(prev => ({
                      ...prev,
                      discount,
                      sellingPrice: price - discount
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled
                  fullWidth
                  label="Selling Price"
                  value={formData.price - (formData.discount || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Stock"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" component="label">
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {formData.images.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formData.images.length} new images selected
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Product ID"
                  value={createFormData.productId}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, productId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={createFormData.type}
                    label="Type"
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="Men">Men</MenuItem>
                    <MenuItem value="Women">Women</MenuItem>
                    <MenuItem value="Kids">Kids</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={createFormData.category}
                    label="Category"
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <MenuItem value="Sherwani">Sherwani</MenuItem>
                    <MenuItem value="Kurta">Kurta</MenuItem>
                    <MenuItem value="Lehenga">Lehenga</MenuItem>
                    <MenuItem value="Saree">Saree</MenuItem>
                    <MenuItem value="Pajama">Pajama</MenuItem>
                    <MenuItem value="Indo-Western">Indo-Western</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sizes</InputLabel>
                  <Select
                    multiple
                    value={createFormData.sizes || []}
                    label="Sizes"
                    onChange={(e) => {
                      const selectedSizes = e.target.value;
                      setCreateFormData(prev => ({
                        ...prev,
                        sizes: Array.isArray(selectedSizes) ? selectedSizes : []
                      }));
                    }}
                  >
                    <MenuItem value="S">S</MenuItem>
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="L">L</MenuItem>
                    <MenuItem value="XL">XL</MenuItem>
                    <MenuItem value="Free Size">Free Size</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Price"
                  value={createFormData.price}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const discount = Number(createFormData.discount || 0);
                    setCreateFormData(prev => ({
                      ...prev,
                      price,
                      sellingPrice: price - discount
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Discount"
                  value={createFormData.discount}
                  onChange={(e) => {
                    const discount = Number(e.target.value);
                    const price = Number(createFormData.price);
                    setCreateFormData(prev => ({
                      ...prev,
                      discount,
                      sellingPrice: price - discount
                    }));
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled
                  fullWidth
                  label="Selling Price"
                  value={createFormData.price - (createFormData.discount || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Stock"
                  value={createFormData.stock}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, stock: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  required
                >
                  Upload Images (Required)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      images: Array.from(e.target.files)
                    }))}
                  />
                </Button>
                {createFormData.images.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {createFormData.images.length} images selected
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={!createFormData.name || !createFormData.productId || !createFormData.images.length}
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProducts;
