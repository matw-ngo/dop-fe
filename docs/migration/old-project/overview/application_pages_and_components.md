# Finzone Frontend - Application Pages and Components

## Table of Contents
- [Overview](#overview)
- [I. Pages](#pages)
  - [1. Home Page](#1-home-page-)
  - [2. Credit Cards Page](#2-credit-cards-page-the-tin-dung)
  - [3. Credit Card Detail Page](#3-credit-card-detail-page-the-tin-dungchi-tiet)
  - [4. Credit Card Comparison Page](#4-credit-card-comparison-page-the-tin-dungso-sanh)
  - [5. Credit Card Redirect Page](#5-credit-card-redirect-page-the-tin-dungchuyen-tiep)
  - [6. Loan Page](#6-loan-page-vay-tieu-dung)
  - [7. Loan Finding Page](#7-loan-finding-page-tim-kiem-vay)
  - [8. Loan Information Page](#8-loan-information-page-thong-tin-vay)
  - [9. Loan Result Page](#9-loan-result-page-ket-qua-vay)
  - [10. Insurance Page](#10-insurance-page-bao-hiem)
  - [11. Car Insurance Page](#11-car-insurance-page-bao-hiem-xe)
  - [12. Tools Page](#12-tools-page-cong-cu)
  - [13. Interest Rate Calculator](#13-interest-rate-calculator-cong-cutinh-lai-tien-gui)
  - [14. Salary Conversion Calculator](#14-salary-conversion-calculator-cong-cutinh-luong-gross-net)
  - [15. Loan Calculator](#15-loan-calculator-cong-cutinh-toan-khoan-vay)
  - [16. Blog Page](#16-blog-page-blog)
  - [17. Blog Detail Page](#17-blog-detail-page-blogid)
  - [18. About Us Page](#18-about-us-page-gioi-thieu)
  - [19. Contact Page](#19-contact-page-lien-he)
  - [20. Terms of Use Page](#20-terms-of-use-page-dieu-khoan-su-dung)
- [II. Components](#components)
  - [1. Navigation Components](#1-navigation-components)
  - [2. Form Components](#2-form-components)
  - [3. Display Components](#3-display-components)
  - [4. Feedback Components](#4-feedback-components)
  - [5. Layout Components](#5-layout-components)
- [III. Module Hierarchy](#iii-module-hierarchy)
  - [1. CreditCard Module](#1-creditcard-module)
  - [2. Insurance Module](#2-insurance-module)
  - [3. Loan Module](#3-loan-module)
  - [4. Tools Module](#4-tools-module)
  - [5. HomePage Module](#5-homepage-module)
- [IV. Navigation Structure](#iv-navigation-structure)
  - [1. Desktop Navigation](#1-desktop-navigation)
  - [2. Mobile Navigation](#2-mobile-navigation)
- [V. Summary](#v-summary)

## Overview

This document describes in detail the pages and components (components) in the Finzone Frontend application, a financial platform that helps users compare and register financial products such as credit cards, consumer loans, and insurance.

## I. Pages

### 1. Home Page (/)
- **File**: [`app/page.tsx`](app/page.tsx)
- **Description**: Main page providing an overview of Finzone services
- **Main Components**:
  - Hero section with banner
  - TabDisplay with 4 tabs
  - Blog section with carousel
  - Community section
- **Style File**: [`app/Home.module.scss`](app/Home.module.scss)

### 2. Credit Cards Page (/the-tin-dung)
- **File**: [`app/the-tin-dung/page.tsx`](app/the-tin-dung/page.tsx)
- **Description**: Page displaying all available credit cards
- **Main Components**:
  - SearchBar for filtering cards
  - CardList with pagination
  - CardTutorial for user guidance
- **Style File**: [`app/the-tin-dung/card-list.module.scss`](app/the-tin-dung/card-list.module.scss)

### 3. Credit Card Detail Page (/the-tin-dung/chi-tiet)
- **File**: [`app/the-tin-dung/chi-tiet/page.tsx`](app/the-tin-dung/chi-tiet/page.tsx)
- **Description**: Detailed view of a specific credit card
- **Main Components**:
  - CardDetail with comprehensive information
  - Review section
  - Suggestion section for similar cards
- **Style File**: [`app/the-tin-dung/chi-tiet/card-detail.module.scss`](app/the-tin-dung/chi-tiet/card-detail.module.scss)

### 4. Credit Card Comparison Page (/the-tin-dung/so-sanh)
- **File**: [`app/the-tin-dung/so-sanh/page.tsx`](app/the-tin-dung/so-sanh/page.tsx)
- **Description**: Page for comparing multiple credit cards
- **Main Components**:
  - Compare component
  - ComparingPanel
- **Style File**: [`app/the-tin-dung/so-sanh/card-comparing.module.scss`](app/the-tin-dung/so-sanh/card-comparing.module.scss)

### 5. Credit Card Redirect Page (/the-tin-dung/chuyen-tiep)
- **File**: [`app/the-tin-dung/chuyen-tiep/page.tsx`](app/the-tin-dung/chuyen-tiep/page.tsx)
- **Description**: Redirect page for credit card applications
- **Main Components**:
  - Redirect component
- **Style File**: [`app/the-tin-dung/chuyen-tiep/card-redirect.module.scss`](app/the-tin-dung/chuyen-tiep/card-redirect.module.scss)

### 6. Loan Page (/vay-tieu-dung)
- **File**: [`app/vay-tieu-dung/page.tsx`](app/vay-tieu-dung/page.tsx)
- **Description**: Main page for consumer loan information
- **Main Components**:
  - LoanModule with loan information
  - ApplyLoanForm
- **Style File**: [`app/vay-tieu-dung/loan-page.module.scss`](app/vay-tieu-dung/loan-page.module.scss)

### 7. Loan Finding Page (/tim-kiem-vay)
- **File**: [`app/tim-kiem-vay/page.tsx`](app/tim-kiem-vay/page.tsx)
- **Description**: Page for finding suitable loan products
- **Main Components**:
  - LoanFinding component
- **Style File**: [`app/tim-kiem-vay/loan-finding.module.scss`](app/tim-kiem-vay/loan-finding.module.scss)

### 8. Loan Information Page (/thong-tin-vay)
- **File**: [`app/thong-tin-vay/page.tsx`](app/thong-tin-vay/page.tsx)
- **Description**: Page for providing additional loan information
- **Main Components**:
  - LoanExtraInfoForm
- **Style File**: [`app/thong-tin-vay/loan-info.module.scss`](app/thong-tin-vay/loan-info.module.scss)

### 9. Loan Result Page (/ket-qua-vay)
- **File**: [`app/ket-qua-vay/page.tsx`](app/ket-qua-vay/page.tsx)
- **Description**: Page displaying loan application results
- **Main Components**:
  - LoanResult component
  - LoanListBox
  - LoanSuccessBox
- **Style File**: [`app/ket-qua-vay/loan-result.module.scss`](app/ket-qua-vay/loan-result.module.scss)

### 10. Insurance Page (/bao-hiem)
- **File**: [`app/bao-hiem/page.tsx`](app/bao-hiem/page.tsx)
- **Description**: Page displaying available insurance products
- **Main Components**:
  - InsuranceModule
  - InsuranceList
- **Style File**: [`app/bao-hiem/insurance.module.scss`](app/bao-hiem/insurance.module.scss)

### 11. Car Insurance Page (/bao-hiem-xe)
- **File**: [`app/bao-hiem-xe/page.tsx`](app/bao-hiem-xe/page.tsx)
- **Description**: Page specifically for car insurance products
- **Main Components**:
  - InsuranceModule with car insurance focus
- **Style File**: [`app/bao-hiem-xe/bao-hiem.module.scss`](app/bao-hiem-xe/bao-hiem.module.scss)

### 12. Tools Page (/cong-cu)
- **File**: [`app/cong-cu/error.tsx`](app/cong-cu/error.tsx)
- **Description**: Main page for financial tools
- **Main Components**:
  - Error component (placeholder)
- **Style File**: [`app/cong-cu/error.module.scss`](app/cong-cu/error.module.scss)

### 13. Interest Rate Calculator (/cong-cu/tinh-lai-tien-gui)
- **File**: [`app/cong-cu/tinh-lai-tien-gui/page.tsx`](app/cong-cu/tinh-lai-tien-gui/page.tsx)
- **Description**: Tool for calculating savings interest rates
- **Main Components**:
  - InterestRate tool
  - IRBanner
  - IRContent
- **Style File**: [`app/cong-cu/tinh-lai-tien-gui/style.module.scss`](app/cong-cu/tinh-lai-tien-gui/style.module.scss)

### 14. Salary Conversion Calculator (/cong-cu/tinh-luong-gross-net)
- **File**: [`app/cong-cu/tinh-luong-gross-net/page.tsx`](app/cong-cu/tinh-luong-gross-net/page.tsx)
- **Description**: Tool for converting between gross and net salary
- **Main Components**:
  - SalaryConversion tool
  - SalaryBanner
  - SalaryContent
- **Style File**: [`app/cong-cu/tinh-luong-gross-net/style.module.scss`](app/cong-cu/tinh-luong-gross-net/style.module.scss)

### 15. Loan Calculator (/cong-cu/tinh-toan-khoan-vay)
- **File**: [`app/cong-cu/tinh-toan-khoan-vay/page.tsx`](app/cong-cu/tinh-toan-khoan-vay/page.tsx)
- **Description**: Tool for calculating loan installments
- **Main Components**:
  - Loan calculator tool
- **Style File**: [`app/cong-cu/tinh-toan-khoan-vay/style.module.scss`](app/cong-cu/tinh-toan-khoan-vay/style.module.scss)

### 16. Blog Page (/blog)
- **File**: [`app/blog/page.tsx`](app/blog/page.tsx)
- **Description**: Main blog page with article listings
- **Main Components**:
  - Blog listing
  - Blog carousel
- **Style File**: [`app/blog/style.module.scss`](app/blog/style.module.scss)

### 17. Blog Detail Page (/blog/[id])
- **File**: [`app/blog/[id]/page.tsx`](app/blog/[id]/page.tsx)
- **Description**: Detailed view of a specific blog article
- **Main Components**:
  - Blog article content
- **Style File**: [`app/blog/[id]/style.module.scss`](app/blog/[id]/style.module.scss)

### 18. About Us Page (/gioi-thieu)
- **File**: [`app/gioi-thieu/page.tsx`](app/gioi-thieu/page.tsx)
- **Description**: Information about Finzone company
- **Main Components**:
  - Company information
- **Style File**: [`app/gioi-thieu/style.module.scss`](app/gioi-thieu/style.module.scss)

### 19. Contact Page (/lien-he)
- **File**: [`app/lien-he/page.tsx`](app/lien-he/page.tsx)
- **Description**: Contact information and form
- **Main Components**:
  - Contact form
  - Contact information
- **Style File**: [`app/lien-he/style.module.scss`](app/lien-he/style.module.scss)

### 20. Terms of Use Page (/dieu-khoan-su-dung)
- **File**: [`app/dieu-khoan-su-dung/page.tsx`](app/dieu-khoan-su-dung/page.tsx)
- **Description**: Terms of use and legal information
- **Main Components**:
  - Terms content
- **Style File**: [`app/dieu-khoan-su-dung/tc.module.scss`](app/dieu-khoan-su-dung/tc.module.scss)

## II. Components

### 1. Navigation Components

#### NavBar
- **File**: [`components/NavBar/index.js`](components/NavBar/index.js)
- **Description**: Main navigation component for the application
- **Features**:
  - Responsive design for desktop and mobile
  - Active route highlighting
  - Dropdown menus for subcategories
- **Style File**: [`components/NavBar/NavBar.module.scss`](components/NavBar/NavBar.module.scss)

#### Breadcrumb
- **File**: [`components/Breadcrumb/breadcrumb.tsx`](components/Breadcrumb/breadcrumb.tsx)
- **Description**: Breadcrumb navigation for page hierarchy
- **Features**:
  - Dynamic breadcrumb generation based on route
  - Clickable navigation links
  - Event tracking integration
- **Style File**: [`components/Breadcrumb/style.module.scss`](components/Breadcrumb/style.module.scss)

### 2. Form Components

#### TextInput
- **File**: [`components/TextInput/text-input.tsx`](components/TextInput/text-input.tsx)
- **Description**: Standard text input component
- **Features**:
  - Validation support
  - Custom styling
  - Error message display
- **Style File**: [`components/TextInput/style.module.scss`](components/TextInput/style.module.scss)

#### TextInputGroup
- **File**: [`components/TextInputGroup/text-input-group.tsx`](components/TextInputGroup/text-input-group.tsx)
- **Description**: Grouped text input component
- **Features**:
  - Multiple input fields in a group
  - Collective validation
- **Style File**: [`components/TextInputGroup/style.module.scss`](components/TextInputGroup/style.module.scss)

#### SelectBox
- **File**: [`components/SelectBox/select-box.tsx`](components/SelectBox/select-box.tsx)
- **Description**: Dropdown selection component
- **Features**:
  - Custom styling
  - Search functionality
  - Multiple selection support
- **Style File**: [`components/SelectBox/style.module.scss`](components/SelectBox/style.module.scss)

#### SelectGroup
- **File**: [`components/SelectGroup/select-group.tsx`](components/SelectGroup/select-group.tsx)
- **Description**: Grouped selection component
- **Features**:
  - Related select boxes
  - Cascading selection logic
- **Style File**: [`components/SelectGroup/style.module.scss`](components/SelectGroup/style.module.scss)

#### TextAreaGroup
- **File**: [`components/TextAreaGroup/index.tsx`](components/TextAreaGroup/index.tsx)
- **Description**: Text area component for longer inputs
- **Features**:
  - Character count
  - Validation
  - Auto-resize
- **Style File**: [`components/TextAreaGroup/style.module.scss`](components/TextAreaGroup/style.module.scss)

#### Slider
- **File**: [`components/Slider/index.tsx`](components/Slider/index.tsx)
- **Description**: Range slider component
- **Features**:
  - Custom range values
  - Step control
  - Visual feedback
- **Style File**: [`components/Slider/style.module.scss`](components/Slider/style.module.scss)

### 3. Display Components

#### Card
- **File**: [`components/Card/index.tsx`](components/Card/index.tsx)
- **Description**: Reusable card component
- **Features**:
  - Customizable content
  - Hover effects
  - Responsive design

#### Carousel
- **File**: [`components/Carousel/carousel.tsx`](components/Carousel/carousel.tsx)
- **Description**: Image/content carousel
- **Features**:
  - Auto-play
  - Custom navigation arrows
  - Touch/swipe support
- **Style File**: [`components/Carousel/styles.module.scss`](components/Carousel/styles.module.scss)
- **Related Files**:
  - [`components/Carousel/CustomNextArrow.tsx`](components/Carousel/CustomNextArrow.tsx)
  - [`components/Carousel/CustomPrevArrow.tsx`](components/Carousel/CustomPrevArrow.tsx)

#### StarRating
- **File**: [`components/StarRating/index.tsx`](components/StarRating/index.tsx)
- **Description**: Star rating display component
- **Features**:
  - Read-only and interactive modes
  - Custom star count
  - Half-star support
- **Style File**: [`components/StarRating/style.module.scss`](components/StarRating/style.module.scss)

#### ResponsiveImage
- **File**: [`components/ResponsiveImage/ResponsiveImage.tsx`](components/ResponsiveImage/ResponsiveImage.tsx)
- **Description**: Responsive image component
- **Features**:
  - Lazy loading
  - Srcset generation
  - Fallback support
- **Related Files**:
  - [`components/ResponsiveImage/BulmaImage.tsx`](components/ResponsiveImage/BulmaImage.tsx)

### 4. Feedback Components

#### Button
- **File**: [`components/Button/button.tsx`](components/Button/button.tsx)
- **Description**: Custom button component
- **Features**:
  - Multiple variants (primary, secondary, etc.)
  - Loading states
  - Disabled states
- **Style File**: [`components/Button/style.module.scss`](components/Button/style.module.scss)

#### Modal
- **File**: [`components/Modal/modal.tsx`](components/Modal/modal.tsx)
- **Description**: Modal dialog component
- **Features**:
  - Custom content
  - Backdrop click to close
  - Animation effects
- **Style File**: [`components/Modal/style.module.scss`](components/Modal/style.module.scss)

#### Loading
- **File**: [`components/Loading/index.js`](components/Loading/index.js)
- **Description**: Loading indicator component
- **Features**:
  - Spinner animation
  - Customizable text
- **Style File**: [`components/Loading/Loading.module.scss`](components/Loading/Loading.module.scss)

#### Spinner
- **File**: [`components/spinner/Spinner.tsx`](components/spinner/Spinner.tsx)
- **Description**: Spinner component for loading states
- **Features**:
  - Customizable size
  - Customizable color

#### ErrorComponent
- **File**: [`components/ErrorComponent/index.tsx`](components/ErrorComponent/index.tsx)
- **Description**: Error display component
- **Features**:
  - Error message display
  - Retry functionality
  - Custom styling
- **Style File**: [`components/ErrorComponent/style.module.scss`](components/ErrorComponent/style.module.scss)

### 5. Layout Components

#### Footer
- **File**: [`components/Footer/index.js`](components/Footer/index.js)
- **Description**: Application footer component
- **Features**:
  - Navigation links
  - Contact information
  - Social media links
- **Style File**: [`components/Footer/Footer.module.scss`](components/Footer/Footer.module.scss)

#### TabDisplay
- **File**: [`components/TabDisplay/index.tsx`](components/TabDisplay/index.tsx)
- **Description**: Tab navigation component
- **Features**:
  - Multiple tabs
  - Active tab highlighting
  - Custom content panels
- **Style File**: [`components/TabDisplay/style.module.scss`](components/TabDisplay/style.module.scss)

#### BorderTab
- **File**: [`components/BorderTab/index.tsx`](components/BorderTab/index.tsx)
- **Description**: Tab component with border styling
- **Features**:
  - Border-based active state
  - Custom styling
- **Style File**: [`components/BorderTab/style.module.scss`](components/BorderTab/style.module.scss)

#### CountdownTimer
- **File**: [`components/CountdownTimer/index.tsx`](components/CountdownTimer/index.tsx)
- **Description**: Countdown timer component
- **Features**:
  - Custom end time
  - Callback on completion
  - Custom formatting

## III. Module Hierarchy

### 1. CreditCard Module

#### Main Component
- **File**: [`modules/CreditCardModule/index.tsx`](modules/CreditCardModule/index.tsx)
- **Description**: Main module for credit card functionality
- **Style File**: [`modules/CreditCardModule/styles.module.scss`](modules/CreditCardModule/styles.module.scss)

#### Sub-components

##### CreditCard/List
- **File**: [`modules/CreditCard/List/index.tsx`](modules/CreditCard/List/index.tsx)
- **Description**: List of credit cards
- **Style File**: [`modules/CreditCard/List/style.module.scss`](modules/CreditCard/List/style.module.scss)

###### CreditCard/List/CardItem
- **File**: [`modules/CreditCard/List/CardItem/index.tsx`](modules/CreditCard/List/CardItem/index.tsx)
- **Description**: Individual credit card item
- **Style File**: [`modules/CreditCard/List/CardItem/style.module.scss`](modules/CreditCard/List/CardItem/style.module.scss)

###### CreditCard/List/CardContent
- **File**: [`modules/CreditCard/List/CardContent/index.tsx`](modules/CreditCard/List/CardContent/index.tsx)
- **Description**: Content section of a card item
- **Style File**: [`modules/CreditCard/List/CardContent/style.module.scss`](modules/CreditCard/List/CardContent/style.module.scss)

###### CreditCard/List/CardFooter
- **File**: [`modules/CreditCard/List/CardFooter/index.tsx`](modules/CreditCard/List/CardFooter/index.tsx)
- **Description**: Footer section of a card item
- **Style File**: [`modules/CreditCard/List/CardFooter/style.module.scss`](modules/CreditCard/List/CardFooter/style.module.scss)

###### CreditCard/List/CardBanner
- **File**: [`modules/CreditCard/List/CardBanner/index.tsx`](modules/CreditCard/List/CardBanner/index.tsx)
- **Description**: Banner section for card items
- **Style File**: [`modules/CreditCard/List/CardBanner/style.module.scss`](modules/CreditCard/List/CardBanner/style.module.scss)

###### CreditCard/List/CardTutorial
- **File**: [`modules/CreditCard/List/CardTutorial/index.tsx`](modules/CreditCard/List/CardTutorial/index.tsx)
- **Description**: Tutorial component for card selection
- **Style File**: [`modules/CreditCard/List/CardTutorial/style.module.scss`](modules/CreditCard/List/CardTutorial/style.module.scss)

##### CreditCard/Detail
- **File**: [`modules/CreditCard/Detail/index.tsx`](modules/CreditCard/Detail/index.tsx)
- **Description**: Detailed view of a credit card
- **Style File**: [`modules/CreditCard/Detail/style.module.scss`](modules/CreditCard/Detail/style.module.scss)

###### CreditCard/Detail/Content
- **File**: [`modules/CreditCard/Detail/Content/index.tsx`](modules/CreditCard/Detail/Content/index.tsx)
- **Description**: Main content of card detail
- **Style File**: [`modules/CreditCard/Detail/Content/style.module.scss`](modules/CreditCard/Detail/Content/style.module.scss)

###### CreditCard/Detail/Content/Review
- **File**: [`modules/CreditCard/Detail/Content/Review/index.tsx`](modules/CreditCard/Detail/Content/Review/index.tsx)
- **Description**: Review section of card detail
- **Style File**: [`modules/CreditCard/Detail/Content/Review/style.module.scss`](modules/CreditCard/Detail/Content/Review/style.module.scss)

###### CreditCard/Detail/Suggestion
- **File**: [`modules/CreditCard/Detail/Suggestion/index.tsx`](modules/CreditCard/Detail/Suggestion/index.tsx)
- **Description**: Suggestion section for similar cards
- **Style File**: [`modules/CreditCard/Detail/Suggestion/style.module.scss`](modules/CreditCard/Detail/Suggestion/style.module.scss)

##### CreditCard/Compare
- **File**: [`modules/CreditCard/Compare/index.tsx`](modules/CreditCard/Compare/index.tsx)
- **Description**: Credit card comparison component
- **Style File**: [`modules/CreditCard/Compare/style.module.scss`](modules/CreditCard/Compare/style.module.scss)

##### CreditCard/ComparingPanel
- **File**: [`modules/CreditCard/ComparingPanel/index.tsx`](modules/CreditCard/ComparingPanel/index.tsx)
- **Description**: Panel for comparing selected cards
- **Style File**: [`modules/CreditCard/ComparingPanel/style.module.scss`](modules/CreditCard/ComparingPanel/style.module.scss)

##### CreditCard/Redirect
- **File**: [`modules/CreditCard/Redirect/index.tsx`](modules/CreditCard/Redirect/index.tsx)
- **Description**: Redirect component for card applications
- **Style File**: [`modules/CreditCard/Redirect/style.module.scss`](modules/CreditCard/Redirect/style.module.scss)

##### CreditCard/SearchBar
- **File**: [`modules/CreditCard/SearchBar/index.tsx`](modules/CreditCard/SearchBar/index.tsx)
- **Description**: Search bar for filtering cards
- **Style File**: [`modules/CreditCard/SearchBar/style.module.scss`](modules/CreditCard/SearchBar/style.module.scss)

##### CreditCard/SearchForm
- **File**: [`modules/CreditCard/SearchForm/index.tsx`](modules/CreditCard/SearchForm/index.tsx)
- **Description**: Advanced search form for cards
- **Style File**: [`modules/CreditCard/SearchForm/style.module.scss`](modules/CreditCard/SearchForm/style.module.scss)

##### CreditCard/ContentLoader
- **File**: [`modules/CreditCard/ContentLoader/Compare/index.tsx`](modules/CreditCard/ContentLoader/Compare/index.tsx)
- **Description**: Content loader for comparison page
- **Style File**: [`modules/CreditCard/ContentLoader/Compare/style.module.scss`](modules/CreditCard/ContentLoader/Compare/style.module.scss)

### 2. Insurance Module

#### Main Component
- **File**: [`modules/InsuranceModule/index.tsx`](modules/InsuranceModule/index.tsx)
- **Description**: Main module for insurance functionality
- **Style File**: [`modules/InsuranceModule/styles.module.scss`](modules/InsuranceModule/styles.module.scss)

#### Sub-components

##### Insurance/List
- **File**: [`modules/Insurance/List/index.tsx`](modules/Insurance/List/index.tsx)
- **Description**: List of insurance products
- **Style File**: [`modules/Insurance/List/style.module.scss`](modules/Insurance/List/style.module.scss)

###### Insurance/List/InsuranceItem
- **File**: [`modules/Insurance/List/InsuranceItem/index.tsx`](modules/Insurance/List/InsuranceItem/index.tsx)
- **Description**: Individual insurance product item
- **Style File**: [`modules/Insurance/List/InsuranceItem/style.module.scss`](modules/Insurance/List/InsuranceItem/style.module.scss)

###### Insurance/List/InsuranceContent
- **File**: [`modules/Insurance/List/InsuranceContent/index.tsx`](modules/Insurance/List/InsuranceContent/index.tsx)
- **Description**: Content section of insurance item
- **Style File**: [`modules/Insurance/List/InsuranceContent/style.module.scss`](modules/Insurance/List/InsuranceContent/style.module.scss)

###### Insurance/List/InsuranceFooter
- **File**: [`modules/Insurance/List/InsuranceFooter/index.tsx`](modules/Insurance/List/InsuranceFooter/index.tsx)
- **Description**: Footer section of insurance item
- **Style File**: [`modules/Insurance/List/InsuranceFooter/style.module.scss`](modules/Insurance/List/InsuranceFooter/style.module.scss)

###### Insurance/List/InsuranceBanner
- **File**: [`modules/Insurance/List/InsuranceBanner/index.tsx`](modules/Insurance/List/InsuranceBanner/index.tsx)
- **Description**: Banner section for insurance items
- **Style File**: [`modules/Insurance/List/InsuranceBanner/style.module.scss`](modules/Insurance/List/InsuranceBanner/style.module.scss)

###### Insurance/List/InsuranceTutorial
- **File**: [`modules/Insurance/List/InsuranceTutorial/index.tsx`](modules/Insurance/List/InsuranceTutorial/index.tsx)
- **Description**: Tutorial component for insurance selection
- **Style File**: [`modules/Insurance/List/InsuranceTutorial/style.module.scss`](modules/Insurance/List/InsuranceTutorial/style.module.scss)

### 3. Loan Module

#### Main Component
- **File**: [`modules/LoanModule/index.tsx`](modules/LoanModule/index.tsx)
- **Description**: Main module for loan functionality
- **Style File**: [`modules/LoanModule/styles.module.scss`](modules/LoanModule/styles.module.scss)

#### Sub-components

##### ApplyLoanForm
- **File**: [`modules/ApplyLoanForm/index.tsx`](modules/ApplyLoanForm/index.tsx)
- **Description**: Form for applying for loans
- **Style File**: [`modules/ApplyLoanForm/style.module.scss`](modules/ApplyLoanForm/style.module.scss)

##### LoanFinding
- **File**: [`modules/LoanFinding/index.tsx`](modules/LoanFinding/index.tsx)
- **Description**: Component for finding suitable loans
- **Style File**: [`modules/LoanFinding/style.module.scss`](modules/LoanFinding/style.module.scss)

##### LoanExtraInfoForm
- **File**: [`modules/LoanExtraInfoForm/index.tsx`](modules/LoanExtraInfoForm/index.tsx)
- **Description**: Form for additional loan information
- **Style File**: [`modules/LoanExtraInfoForm/style.module.scss`](modules/LoanExtraInfoForm/style.module.scss)

##### LoanResult
- **File**: [`modules/LoanResult/index.tsx`](modules/LoanResult/index.tsx)
- **Description**: Results component for loan applications
- **Style File**: [`modules/LoanResult/style.module.scss`](modules/LoanResult/style.module.scss)

###### LoanResult/LoanListBox
- **File**: [`modules/LoanResult/LoanListBox.tsx`](modules/LoanResult/LoanListBox.tsx)
- **Description**: List box for loan results

###### LoanResult/LoanSuccessBox
- **File**: [`modules/LoanResult/LoanSuccessBox.tsx`](modules/LoanResult/LoanSuccessBox.tsx)
- **Description**: Success message box for loan applications

##### LoanRecommendation
- **File**: [`modules/LoanRecommendation/index.tsx`](modules/LoanRecommendation/index.tsx)
- **Description**: Component for loan recommendations
- **Style File**: [`modules/LoanRecommendation/style.module.scss`](modules/LoanRecommendation/style.module.scss)

###### LoanRecommendation/CreditCardRecommendation
- **File**: [`modules/LoanRecommendation/CreditCardRecommendation.tsx`](modules/LoanRecommendation/CreditCardRecommendation.tsx)
- **Description**: Credit card recommendation component

##### OtpForm
- **File**: [`modules/OtpForm/index.tsx`](modules/OtpForm/index.tsx)
- **Description**: OTP verification form
- **Style File**: [`modules/OtpForm/styles.module.scss`](modules/OtpForm/styles.module.scss)

##### ConsentPopup
- **File**: [`modules/ConsentPopup/consent-popup.tsx`](modules/ConsentPopup/consent-popup.tsx)
- **Description**: Consent popup for data processing
- **Style File**: [`modules/ConsentPopup/style.module.scss`](modules/ConsentPopup/style.module.scss)

### 4. Tools Module

#### Interest Rate Calculator
- **File**: [`modules/Tools/InterestRate/index.tsx`](modules/Tools/InterestRate/index.tsx)
- **Description**: Interest rate calculator tool
- **Style File**: [`modules/Tools/InterestRate/style.module.scss`](modules/Tools/InterestRate/style.module.scss)

###### InterestRate/IRBanner
- **File**: [`modules/Tools/InterestRate/IRBanner/index.tsx`](modules/Tools/InterestRate/IRBanner/index.tsx)
- **Description**: Banner for interest rate tool
- **Style File**: [`modules/Tools/InterestRate/IRBanner/style.module.scss`](modules/Tools/InterestRate/IRBanner/style.module.scss)

###### InterestRate/IRContent
- **File**: [`modules/Tools/InterestRate/IRContent/index.tsx`](modules/Tools/InterestRate/IRContent/index.tsx)
- **Description**: Content for interest rate tool
- **Style File**: [`modules/Tools/InterestRate/IRContent/style.module.scss`](modules/Tools/InterestRate/IRContent/style.module.scss)

#### Salary Conversion Calculator
- **File**: [`modules/Tools/SalaryConversion/index.tsx`](modules/Tools/SalaryConversion/index.tsx)
- **Description**: Salary conversion calculator tool
- **Style File**: [`modules/Tools/SalaryConversion/style.module.scss`](modules/Tools/SalaryConversion/style.module.scss)

###### SalaryConversion/SalaryBanner
- **File**: [`modules/Tools/SalaryConversion/SalaryBanner/index.tsx`](modules/Tools/SalaryConversion/SalaryBanner/index.tsx)
- **Description**: Banner for salary conversion tool
- **Style File**: [`modules/Tools/SalaryConversion/SalaryBanner/style.module.scss`](modules/Tools/SalaryConversion/SalaryBanner/style.module.scss)

###### SalaryConversion/SalaryContent
- **File**: [`modules/Tools/SalaryConversion/SalaryContent/index.tsx`](modules/Tools/SalaryConversion/SalaryContent/index.tsx)
- **Description**: Content for salary conversion tool
- **Style File**: [`modules/Tools/SalaryConversion/SalaryContent/style.module.scss`](modules/Tools/SalaryConversion/SalaryContent/style.module.scss)

#### Savings Calculator
- **File**: [`modules/Tools/Saving/index.tsx`](modules/Tools/Saving/index.tsx)
- **Description**: Savings calculator tool
- **Style File**: [`modules/Tools/Saving/style.module.scss`](modules/Tools/Saving/style.module.scss)

###### Saving/SavingBanner
- **File**: [`modules/Tools/Saving/SavingBanner/index.tsx`](modules/Tools/Saving/SavingBanner/index.tsx)
- **Description**: Banner for savings calculator
- **Style File**: [`modules/Tools/Saving/SavingBanner/style.module.scss`](modules/Tools/Saving/SavingBanner/style.module.scss)

###### Saving/SavingContent
- **File**: [`modules/Tools/Saving/SavingContent/index.tsx`](modules/Tools/Saving/SavingContent/index.tsx)
- **Description**: Content for savings calculator
- **Style File**: [`modules/Tools/Saving/SavingContent/style.module.scss`](modules/Tools/Saving/SavingContent/style.module.scss)

###### Saving/SavingItem
- **File**: [`modules/Tools/Saving/SavingItem/index.tsx`](modules/Tools/Saving/SavingItem/index.tsx)
- **Description**: Individual savings item

### 5. HomePage Module

#### BlogSection
- **File**: [`modules/HomePage/BlogSection/index.tsx`](modules/HomePage/BlogSection/index.tsx)
- **Description**: Blog section on home page
- **Style File**: [`modules/HomePage/BlogSection/styles.module.scss`](modules/HomePage/BlogSection/styles.module.scss)

###### BlogSection/BlogItem
- **File**: [`modules/HomePage/BlogSection/BlogItem.tsx`](modules/HomePage/BlogSection/BlogItem.tsx)
- **Description**: Individual blog item

###### BlogSection/BlogMobileCarousel
- **File**: [`modules/HomePage/BlogSection/BlogMobileCarousel.tsx`](modules/HomePage/BlogSection/BlogMobileCarousel.tsx)
- **Description**: Mobile carousel for blog items

#### Community
- **File**: [`modules/HomePage/Community/index.tsx`](modules/HomePage/Community/index.tsx)
- **Description**: Community section on home page
- **Style File**: [`modules/HomePage/Community/styles.module.scss`](modules/HomePage/Community/styles.module.scss)

## IV. Navigation Structure

### 1. Desktop Navigation

The desktop navigation is implemented using the [`NavBar`](components/NavBar/index.js) component with the following structure:

- **Logo**: Links to home page
- **Main Navigation Items**:
  - Trang chủ (Home)
  - Thẻ tín dụng (Credit Cards)
    - Danh sách thẻ (Card List)
    - So sánh thẻ (Card Comparison)
  - Vay tiêu dùng (Consumer Loans)
    - Tìm kiếm vay (Find Loans)
    - Tính toán khoản vay (Loan Calculator)
  - Bảo hiểm (Insurance)
    - Bảo hiểm cá nhân (Personal Insurance)
    - Bảo hiểm xe (Car Insurance)
  - Công cụ (Tools)
    - Tính lãi tiền gửi (Savings Interest Calculator)
    - Tính lương Gross/Net (Salary Calculator)
  - Blog
- **User Actions**:
  - Login/Register button
  - Language selector

### 2. Mobile Navigation

The mobile navigation is a responsive version of the desktop navigation with:

- **Hamburger Menu**: Collapsible menu for mobile screens
- **Touch-friendly Interface**: Optimized for touch interactions
- **Swipe Gestures**: Support for swipe navigation
- **Bottom Navigation**: Quick access to main sections

## V. Summary

The Finzone Frontend application consists of 20+ pages organized into 5 main modules:

1. **CreditCard Module**: Handles all credit card related functionality
2. **Insurance Module**: Manages insurance product listings and details
3. **Loan Module**: Handles loan applications and calculations
4. **Tools Module**: Provides financial calculation tools
5. **HomePage Module**: Manages home page specific components

The application uses 50+ reusable components organized into categories:

1. **Navigation Components**: NavBar, Breadcrumb
2. **Form Components**: TextInput, SelectBox, Slider, etc.
3. **Display Components**: Card, Carousel, StarRating, etc.
4. **Feedback Components**: Button, Modal, Loading, etc.
5. **Layout Components**: Footer, TabDisplay, etc.

The navigation structure is responsive, with different implementations for desktop and mobile views, ensuring optimal user experience across all devices.