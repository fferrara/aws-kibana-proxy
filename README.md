# HTTPS Proxy for AWS Kibana

**Important** 

Inspired by https://github.com/santthosh/aws-es-kibana. The main difference are:

- Proxy uses HTTPS instead of HTTP
- Only proxying Kibana, not ES

## Concept

Firstly, you need to set IP-based restriction on AWS ES instance. This allows only your proxy's IP to perform requests.

[Link](https://aws.amazon.com/pt/blogs/security/how-to-control-access-to-your-amazon-elasticsearch-service-domain/) to the AWS doc to set IP-based access policy.

Then, it's just installing the proxy on your proxy server and connect to the proxy URL. Example:

    https://my.proxy.server:9200/_plugin/kibana

Optionally, you can set Basic HTTP Auth on your proxy endpoint.

## Usage

Install npm module

    npm install aws-kibana-proxy

Run the proxy

    aws-kibana-proxy -key {{PATH_TO_SSL_KEY}} -cert {{PATH_TO_SSL_CERT}} [options]

### Optional arguments

* `-b`, `--bind-address`:
    - _The ip address to bind to._
    - **Required:** False
    - **Default:** `127.0.0.1`
* `-p`, `--port`:
    - _The port to bind to._
    - **Required:** False
    - **Default:** `9200`
* `-r`, `--region`:
    - _The AWS region of the Elasticsearch cluster._
    - **Required:** False
    - **Default:** Determined via the `$REGION` environment variable, or parsed from Elasticsearch endpoint URL
* `-u`, `--user`:
    - _Set a basic auth username that will be required for all requests to the proxy._
    - **Required:** False
    - **Default:** Defaults to `$USER` if the flag is passed with no value, otherwise no username is required
* `-a`, `--password`:
    - _Set a basic auth password that will be required for all requests to the proxy._
    - **Required:** False
    - **Default:** Defaults to `$PASSWORD` if the flag is passed with no value, otherwise no password is required
* `-s`, `--silent`:
    - _Do not display figlet banner._
    - **Required:** False
    - **Default:** False; display the banner

