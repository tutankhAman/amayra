/frontend  
│── /public                 # Static assets (favicons, logos, fonts, etc.)  
│   │── favicon.ico         # Website icon  
│   │── logo.png            # Store logo  
│   │── robots.txt          # SEO & crawler rules  
│── /src  
│   │── /assets             # Images, icons, fonts  
│   │   │── /images         # Product images, banners, etc.  
│   │   │── /icons          # SVG & PNG icons  
│   │   │── /fonts          # Custom fonts if needed  
│   │── /components         # Reusable UI components  
│   │   │── /buttons        # Button components (Primary, Secondary, etc.)  
│   │   │── /cards          # Product cards, user cards, etc.  
│   │   │── /modals         # Pop-ups & dialogs  
│   │   │── /inputs         # Form inputs, search bars, etc.  
│   │   │── /loaders        # Loading spinners, skeleton loaders  
│   │── /pages              # Main app pages  
│   │   │── Home.jsx        # Homepage  
│   │   │── Shop.jsx        # Shop page  
│   │   │── Product.jsx     # Single product page  
│   │   │── Cart.jsx        # Shopping cart page  
│   │   │── Checkout.jsx    # Checkout process  
│   │   │── Orders.jsx      # Order history & tracking  
│   │   │── Profile.jsx     # User profile page  
│   │   │── Login.jsx       # Login page  
│   │   │── Signup.jsx      # Signup page  
│   │   │── NotFound.jsx    # 404 Page  
│   │── /layouts            # Shared layouts for pages  
│   │   │── Navbar.jsx      # Top navigation bar  
│   │   │── Footer.jsx      # Footer section  
│   │   │── Sidebar.jsx     # Sidebar for filters (Shop page)  
│   │── /context            # Global state management (Context API)  
│   │   │── AuthContext.jsx # Handles authentication state  
│   │   │── CartContext.jsx # Handles cart state  
│   │   │── ThemeContext.jsx # Handles dark/light mode  
│   │── /hooks              # Custom React hooks  
│   │   │── useAuth.js      # Hook to manage auth state  
│   │   │── useCart.js      # Hook to manage shopping cart  
│   │   │── useFetch.js     # Hook for API fetching  
│   │── /utils              # Utility/helper functions  
│   │   │── api.js          # Handles API requests  
│   │   │── formatPrice.js  # Formats prices properly  
│   │   │── validateForm.js # Form validation logic  
│   │── /styles             # Global styles & theme   ..
│   │   │── globals.css     # Main global styles  
│   │   │── tailwind.css    # Tailwind imports (if using)  
│   │── /routes             # React Router setup  
│   │   │── index.jsx       # Central routing file  
│   │── App.jsx             # Main app component  
│   │── main.jsx            # Renders App.jsx  
│── package.json            # Project dependencies & scripts  
│── vite.config.js          # Vite config  
│── .gitignore              # Ignore unnecessary files  
│── README.md               # Project documentation  
