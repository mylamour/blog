---
layout: post
title: Feature Engineering Notes (Part 2)
categories: Security Engineer
kerywords: feature engineering meituan machine learning practice machine learning
tags: AI and Machine Learning Learning Data Mining
translated: true
---

# Intro

These notes come from reading Chapter 2 of "Meituan Machine Learning Practice" — took me a while to finally write them up. When you're learning feature engineering, most of what you find online is just a list of methods and how to implement them. Part 1 is here: [sklearn and feature engineering](https://github.com/mylamour/blog/issues/23). But what's usually missing is which method works in which scenario. This book actually fills that gap. Meituan also has a tech blog post on it: [A Survey of Data Cleaning and Feature Processing in Machine Learning](https://tech.meituan.com/machinelearning_data_feature_process.html)

# Data Analysis and Feature Extraction

First thing you need to know is what type of data you're working with. Data comes in many types: numerical, discrete, text, image, video, etc. All of this needs to be vectorized. Once vectorized, using domain knowledge to surface the hidden patterns in that data is really the crux of the whole thing. This breaks down into two steps: data analysis and feature extraction. Data analysis figures out which factors are actually related to your prediction target. Feature extraction pulls those relevant factors out and represents them as numerical variables.

The exploratory data analysis mentioned in the book helps when you don't have much prior knowledge about the data and aren't sure how to approach it — you use visualization to discover patterns and characteristics.

Exploratory data analysis mainly covers two techniques: visualization and quantitative methods. Visualization includes all kinds of charts — box plots, histograms, multivariate plots, scatter plots, stem-and-leaf plots, parallel coordinates, odds ratios, multidimensional scaling, target projection, PCA, dimensionality reduction, nonlinear dimensionality reduction, etc. Quantitative methods cover things like mean, variance, kurtosis, quantiles, skewness, etc.

Below are the analysis approaches for different types of features.

# Data Features and Feature Processing

## Numerical Features

Numerical data can be fed directly as input, but that doesn't mean you can skip feature engineering on it.

Usually, applying some numerical transformation to numerical features gives you a decent boost. For numerical features, the main things to think about are scale and distribution. Models where the target variable is a smooth function of the inputs — like linear regression, logistic regression — are sensitive to the scale of input features. So in these cases, you need **normalization**. If the model isn't sensitive, you can skip it. If the model makes implicit or explicit assumptions about the relationship between input features and the target variable, then data distribution matters. For example, linear regression typically uses squared loss, which is equivalent to assuming prediction errors follow a Gaussian distribution.

Here are 8 common ways to process numerical features: truncation, binarization, binning (basically discretizing numerical variables), scaling, missing value handling, feature crossing, nonlinear encoding, and row statistics.

| Numerical Feature Processing | Description | Notes |
|------------------------------|-------------|-------|
| Truncation | For continuous data, too much precision is sometimes just noise | |
| Binarization | For count features, decide whether to keep the raw count or convert to a binary indicator of existence | e.g., clicks, play counts, page views, comment counts |
| Binning | A sampling method for features — basically discretizing numerical variables | e.g., treating features a, b, c as one group and d, e, f as another |
| Scaling | Scale numerical variables to a fixed range | Standard scaling, square root scaling, log scaling, norm-based normalization, etc. |
| Missing Value Handling | Most models can't handle missing features, and missing features hurt performance | Imputation (mean, median), ignore, use a model to predict the missing values first |
| Feature Crossing | Represents interactions between features, e.g., +, -, ×, ÷. Can introduce nonlinearity into linear models to boost expressiveness | FM/FFM can do automatic feature crossing |
| Nonlinear Encoding | Use nonlinear encoding to improve linear model performance | e.g., polynomial kernel, Gaussian kernel, or using leaf nodes of a random forest to encode and feed into a linear model |
| Row Statistics | Simple statistics computed over vectors | e.g., number of null values, count of positive/negative values, mean, variance, etc. |


## Categorical Features

The values in categorical features don't have mathematical meaning — they're qualitative and can't be used in arithmetic.

| Categorical Feature | Description | Notes |
|---------------------|-------------|-------|
| Ordinal Encoding | Assign a number to each category | Training multiple models and blending them can further boost performance |
| One-hot Encoding | Each feature value maps to one dimension | |
| Hierarchical Encoding | Split digits into levels, then apply ordinal encoding at each level | Honestly not totally sure what this means — the examples given are postal codes and ID numbers |
| Hash Encoding | Use different hash functions, then blend the results to improve model performance | For categories with tons of unique values, one-hot encoding gives you a very sparse matrix. Ordinal encoding and hierarchical encoding can be seen as special cases of hash encoding |
| Count Encoding | Encode categorical features by their frequency count | Sensitive to outliers, and there's a chance of value conflicts |
| Count-rank Encoding | Encode based on the rank of counts | Not sensitive to outliers, no conflicts in categorical values |
| Target Encoding | Encode categorical features based on the target variable | e.g., using historical data to predict future outcomes — split train/validation by time, then use historical data within the same time window size to encode the categorical features |
| Cross between categorical features | Crossing categories to generate new ones | |
| Cross between categorical and numerical features | Crossing generates new categories | Heavily dependent on domain expertise |


These are arguably the two most common feature types in machine learning. But there are others — time features, spatial features, text features, etc.

| Data Feature | Processing Method | Description | Notes |
|--------------|-------------------|-------------|-------|
| Time Features | A single time variable can be treated directly as a categorical variable. Time series uses sliding window statistics | Time series contains not just a 1D variable but also other variables like temperature, rainfall, order counts, etc. | |
| Spatial Features | Lat/long can be converted to numerical variables, or hashed. Distance calculations have even more options | | |

## Text Features

This gets into NLP territory — worth reading up on separately. Text features tend to produce very sparse feature matrices. Common preprocessing steps include: lowercasing, tokenization, removing noise characters, stemming, spell correction, lemmatization, punctuation encoding, document features, entity insertion and extraction, Word2Vec, text similarity, stop word removal, rare word removal, TF-IDF, LDA, LSA, etc.

* Corpus construction
* Text cleaning
* Tokenization (POS tagging, lemmatization and stemming, text statistical features, N-Gram models)
* Skip-Gram model (bag-of-words, bag-of-words model, TF-IDF)
* Cosine similarity
* Jaccard similarity
* Levenshtein distance
* Latent Semantic Analysis
* Word2Vec

Not going to cover all the details here — in practice, a real NLP task rarely uses the entire pipeline end-to-end. And Word2Vec can embed semantic information about words into vectors, which is pretty handy.

# Feature Selection

Feature selection has three goals: first, **simplify the model** to make it easier to understand; second, **improve performance** by saving storage and compute; third, **improve generalization** by reducing overfitting. The premise of feature selection is that your training set has a lot of redundant or irrelevant features, and removing them won't cause information loss. Redundant and irrelevant are different things — if a feature is useful but strongly correlated with another useful feature, that's redundancy.

Feature selection generally involves: a generation process, an evaluation function, a stopping criterion, and a validation process. To do feature selection, you first need to generate candidate feature subsets, then measure how important or useful they are. That means you need to quantify the relationship between feature variables and the target variable.

Here are some selection methods (putting this in a table was a pain...):

![](https://img.iami.xyz/images/mldl/feature_select.png)

That's about the complete set of notes on feature selection. At this point, you should have a solid understanding of what's arguably the most important part of machine learning — feature engineering. Domain expertise is also critical, of course. A few more things worth keeping in mind:

* A simple model trained on lots of data beats a complex model trained on little data
* If your feature engineering is good enough, even a simple model can perform really well
* Algorithms are easier to understand than feature engineering. Theory is easy, practice is hard — the algorithm you pick is usually already well-known, but getting good performance requires constantly iterating on your feature engineering

# Resources

* [sklearn and feature engineering](https://github.com/mylamour/blog/issues/23)
* [A Survey of Data Cleaning and Feature Processing in Machine Learning](https://tech.meituan.com/machinelearning_data_feature_process.html)
