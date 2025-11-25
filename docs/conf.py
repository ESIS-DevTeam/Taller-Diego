# Configuration file for the Sphinx documentation builder.
# -- Project information -----------------------------------------------------

project = 'Taller Diego - Backend API'
copyright = '2025, ESIS-DevTeam'
author = 'ESIS-DevTeam'
release = '1.0'

# -- General configuration ---------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx.ext.viewcode',
    'sphinx.ext.intersphinx',
]

templates_path = ['_templates']
exclude_patterns = ['_build']

# -- Options for HTML output -------------------------------------------------

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

# -- Options for autodoc extension -------------------------------------------

autodoc_member_order = 'bysource'
autodoc_typehints = 'description'

# Path to backend source code
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

# Napoleon settings
napoleon_google_docstring = False
napoleon_use_param = True
napoleon_use_rtype = True
