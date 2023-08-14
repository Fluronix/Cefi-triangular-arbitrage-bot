from setuptools import setup, find_packages

setup(
    name="utilslib",
    version="0.1.0",
    packages=find_packages(include=["utils", "utils.*"]),
)
