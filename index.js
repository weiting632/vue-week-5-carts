







import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const site ='https://vue3-course-api.hexschool.io/v2/';
const api_path = 'tomyalan978';


const productModal={
    //當id變動時,取得遠端資料，呈現modal
    props:['id', 'addToCart','openModal'],
    data(){
        return{
            modal:{},
            tempProduct:{},
            qty:1,
        };
        
    },
    template: '#userProductModal',
    watch:{
        id(){
            if(this.id){
                console.log('productModal:',this.id);
                axios.get(`${site}api/${api_path}/product/${this.id}`).then((res)=>{
                    console.log('單一產品:',res.data.product);
                    this.tempProduct = res.data.product;
                    this.modal.show();
                });
            }
           
        }
    },
    methods:{
        hide(){
            this.modal.hide();
        }
    },
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal);
        
        this.$refs.modal.addEventListener('hidden.bs.modal',(event)=>{
           this.openModal('');
        });
        // this.modal.show();
    }
};
const app = createApp({
    data(){
        return {
            products: [],
            productId: '',
            cart: {},
            qty:1,
            loadingItem: '',//存 id
            user:{
                email:'',
            },
           
        };
    },
    methods:{
        getProducts(){
            axios.get(`${site}api/${api_path}/products/all`).then((res)=>{
                console.log(res);
                this.products = res.data.products;
            }).catch(err => {
                console.log(err);
            })
        },
        openModal(id){
            this.productId = id;
            console.log('外層帶入 productId:',id);
        },
        addToCart(product_id, qty = 1){
            const data ={
                product_id,
                qty,
            };
            axios.post(`${site}api/${api_path}/cart`,{ data }).then((res)=>{
                console.log('加入購物車',res.data);
                this.$refs.productModal.hide();
                this.getCarts();
            })

        },
        getCarts(){
            axios.get(`${site}api/${api_path}/cart`).then((res)=>{
                console.log('購物車',res.data);
                this.cart = res.data.data;
            })
        },
        updateCartItem(item){ //購物車的id 產品的id
            const data = {
                product_id : item.product_id,
                qty: item.qty
            };
            this.loadingItem = item.id;
            axios.put(`${site}api/${api_path}/cart/${item.id}`, { data })
            .then((res)=>{
                console.log('更新購物車',res.data);
                this.getCarts();
                this.loadingItem ="";
            }).catch((err) => {
                alert(err.response.data.message);
            })
        },
        deleteItem(item){
            this.loadingItem = item.id;
            axios.delete(`${site}api/${api_path}/cart/${item.id}`).then((res) => {
                console.log('刪除購物車', res.data);
                this.loadingItem ="";
                this.getCarts();
            });
        },
        deleteCartsItem(){
            axios.delete(`${site}api/${api_path}/carts`).then((res)=>{
                alert("確認清除全品項?");
                this.getCarts();
            }).catch((err) => {
                alert(err.response.data.message);
            });
        }
    },
    components:{
        productModal,
    },
    mounted(){
        this.getProducts();
        this.getCarts();
    }
});
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);



app.mount('#app');