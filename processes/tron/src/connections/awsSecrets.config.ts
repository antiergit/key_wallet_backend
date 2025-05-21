import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";
  
  import { config } from "dotenv";
  config();
  
  const secretName = process.env.SECRETNAME;
  const region = process.env.REGION;
  
  const client = new SecretsManagerClient({ region });
  
  class AwsProvider {
    config: any = {};
  
    async connectAwsSecretManager(): Promise<string | undefined> {
      try {
        const command = new GetSecretValueCommand({ SecretId: secretName });
        const response = await client.send(command);
        let data;
  
        if (response.SecretString) {
          data = JSON.parse(response.SecretString);
  
          console.log(`🖐️ ~ Aws secret manager connected`);
          console.log({ body: Object.keys(data) }, `🖐️ ~ Aws secret manager connected`);
          return (this.config = data);
        } else if (response.SecretBinary) {
          data = JSON.parse(Buffer.from(response.SecretBinary).toString("utf-8"));
  
          console.log({ body: Object.keys(data) },`🖐️ ~ Aws secret manager connected`);
          return (this.config = data);
        }
      } catch (error) {
        console.log({ body: error },"🔥 ~ connectAwsSecretManager error");
        throw error;
      }
    }
  }
  
  const AwsSecretManagerConfig = new AwsProvider();
  export default AwsSecretManagerConfig;