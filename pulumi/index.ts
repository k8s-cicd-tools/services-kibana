import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

const appLabels = { app: "kibana" };
const deployment = new k8s.apps.v1.Deployment("kibana", {
    metadata: {
        labels: appLabels,
        name: "kibana",
        namespace: "monitoring",
    },
    spec: {
        replicas: 1,
        selector: { matchLabels: appLabels },
        template: {
            metadata: { labels: appLabels },
            spec: {
                containers: [
                    {
                        name: "kibana",
                        image: "docker.elastic.co/kibana/kibana:7.17.0",
                        resources: {
                            limits: { cpu: "1000m"},
                            requests: { cpu: "100m"},
                        },
                        env: [{ name: "ELASTICSEARCH_URL", value: "http://elasticsearch:9200" }],
                        ports: [{ containerPort: 5601 }],
                    },
                ],
            },
        },
    },
});

const service = new k8s.core.v1.Service("kibana", {
    metadata: {
        name: "kibana",
        namespace: "monitoring",
    },
    spec: {
        selector: { app: "kibana" },
        type: "NodePort",
        ports: [{ port: 8080, targetPort: 5601, nodePort: 30000 }],
    },
});

export const name = deployment.metadata.name;

