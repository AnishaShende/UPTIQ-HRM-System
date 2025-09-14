# Example API Requests and Responses

## Basic Query Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "What are the leave policies?",
       "method": "basic",
       "top_k": 4,
       "rerank": true
     }'
```

### Response

```json
{
  "query": "What are the leave policies?",
  "method": "basic",
  "answer": "Based on the HR policies, employees are entitled to 18 paid annual leave days per calendar year. Applications must be made at least 5 days in advance, except in emergencies. A maximum of 6 unused days can be carried forward to the next year. Additionally, employees receive 10 paid sick leave days annually and 7 casual leave days each year.",
  "execution_time": 1.23,
  "pipeline_stages": {
    "query_transformation": {
      "method": "basic",
      "transformed_queries": ["What are the leave policies?"]
    },
    "retrieval": {
      "num_documents": 3,
      "documents": [
        "Each employee is entitled to 18 paid annual leave days per calendar year...",
        "Employees receive 10 paid sick leave days annually...",
        "Employees are granted 7 casual leave days each year..."
      ]
    },
    "routing": {
      "logical_routing": {
        "file_name": "leave_policy.txt"
      },
      "semantic_routing": {
        "template_name": "hr_template",
        "similarity_score": 0.89
      }
    }
  },
  "metadata": {}
}
```

## Multi-Query Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "How does performance review work?",
       "method": "multi_query",
       "top_k": 5,
       "rerank": true
     }'
```

### Response

```json
{
  "query": "How does performance review work?",
  "method": "multi_query",
  "answer": "Performance reviews at Uptiq are conducted twice annually in June and December. The evaluation process utilizes a 360-degree feedback approach, including input from peers, managers, and self-assessments. The criteria assessed include technical skills, productivity, collaboration, innovation, and alignment with company values. Informal feedback sessions are also held in March and September.",
  "execution_time": 2.45,
  "pipeline_stages": {
    "query_transformation": {
      "method": "multi_query",
      "transformed_queries": [
        "How does performance review work?",
        "What is the performance evaluation process?",
        "When are performance reviews conducted?",
        "What criteria are used in performance reviews?",
        "How often are performance reviews done?"
      ]
    },
    "retrieval": {
      "num_documents": 4,
      "documents": [
        "Performance reviews are conducted twice annually in June and December...",
        "The evaluation criteria include technical skills, productivity...",
        "The process utilizes 360-degree feedback including peer, manager...",
        "Informal feedback sessions are held in March and September..."
      ]
    },
    "reranking": {
      "method": "multi_query",
      "num_documents": 4
    },
    "routing": {
      "logical_routing": {
        "file_name": "performance_review_policy.txt"
      },
      "semantic_routing": {
        "template_name": "hr_template",
        "similarity_score": 0.92
      }
    }
  },
  "metadata": {}
}
```

## RAG-Fusion Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "What expenses are reimbursed for work from home?",
       "method": "rag_fusion",
       "top_k": 6,
       "rerank": true
     }'
```

### Response

```json
{
  "query": "What expenses are reimbursed for work from home?",
  "method": "rag_fusion",
  "answer": "Under Uptiq's Work From Home policy, internet charges up to INR 1,500 per month are reimbursed with valid bills. However, electricity bills and other utility expenses are not covered. Employees are required to maintain a dedicated workspace for remote work and may work from home up to 2 days per week with manager approval.",
  "execution_time": 3.12,
  "pipeline_stages": {
    "query_transformation": {
      "method": "rag_fusion",
      "transformed_queries": [
        "What expenses are reimbursed for work from home?",
        "What costs are covered for remote work?",
        "What can I claim for working from home?",
        "What reimbursements are available for WFH?"
      ]
    },
    "retrieval": {
      "num_documents": 5,
      "documents": [
        "Internet charges up to INR 1,500 per month are reimbursed with valid bills...",
        "Employees may work from home up to 2 days per week...",
        "A dedicated workspace is required for remote work...",
        "Electricity bills are not reimbursed...",
        "Manager approval is required for remote work..."
      ]
    },
    "reranking": {
      "method": "rag_fusion",
      "num_documents": 5
    },
    "routing": {
      "logical_routing": {
        "file_name": "work_from_home_policy.txt"
      },
      "semantic_routing": {
        "template_name": "hr_template",
        "similarity_score": 0.87
      }
    }
  },
  "metadata": {}
}
```

## Decomposition Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "What are the leave and performance review policies?",
       "method": "decomposition",
       "top_k": 4,
       "rerank": false
     }'
```

### Response

```json
{
  "query": "What are the leave and performance review policies?",
  "method": "decomposition",
  "answer": "**Leave and Performance Review Policies at Uptiq**\n\n**Leave Policies:**\n- **Annual Leave:** 18 days per year, carry forward up to 6 days\n- **Sick Leave:** 10 days per year, medical certificate required for absences exceeding 2 days\n- **Casual Leave:** 7 days per year, requires 2 days' notice\n\n**Performance Review Process:**\n- **Frequency:** Conducted twice annually in June and December\n- **Evaluation Criteria:** Technical skills, productivity, collaboration, innovation, alignment with company values\n- **Feedback Method:** 360-degree approach with peer, manager, and self-assessments",
  "execution_time": 4.56,
  "pipeline_stages": {
    "query_transformation": {
      "method": "decomposition",
      "transformed_queries": [
        "What are the leave policies at uptiq?",
        "How does the performance review process work?",
        "What are the evaluation criteria for performance reviews?"
      ]
    },
    "retrieval": {
      "num_documents": 6,
      "documents": [
        "Each employee is entitled to 18 paid annual leave days...",
        "Performance reviews are conducted twice annually...",
        "The evaluation criteria include technical skills...",
        "Employees receive 10 paid sick leave days...",
        "Casual leave applications should be submitted...",
        "360-degree feedback including peer, manager..."
      ]
    },
    "routing": {
      "logical_routing": {
        "file_name": "leave_policy.txt"
      },
      "semantic_routing": {
        "template_name": "hr_template",
        "similarity_score": 0.85
      }
    }
  },
  "metadata": {}
}
```

## Step-Back Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Can I carry forward 8 unused annual leave days?",
       "method": "step_back",
       "top_k": 4,
       "rerank": true
     }'
```

### Response

```json
{
  "query": "Can I carry forward 8 unused annual leave days?",
  "method": "step_back",
  "answer": "Based on Uptiq's leave policy, you can carry forward unused annual leave days, but there is a limit. The policy states that a maximum of 6 unused annual leave days can be carried forward to the next year. Since you want to carry forward 8 days, this exceeds the policy limit. You would only be able to carry forward 6 days, and the remaining 2 days would be forfeited.",
  "execution_time": 2.78,
  "pipeline_stages": {
    "query_transformation": {
      "method": "step_back",
      "transformed_queries": [
        "What is Uptiq's policy on carrying forward unused annual leave?"
      ]
    },
    "retrieval": {
      "num_documents": 3,
      "documents": [
        "A maximum of 6 unused days can be carried forward to the next year...",
        "Each employee is entitled to 18 paid annual leave days per calendar year...",
        "Applications must be made at least 5 days in advance..."
      ]
    },
    "routing": {
      "logical_routing": {
        "file_name": "leave_policy.txt"
      },
      "semantic_routing": {
        "template_name": "hr_template",
        "similarity_score": 0.91
      }
    }
  },
  "metadata": {}
}
```

## HyDE Request

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "What should I do if my company laptop gets stolen?",
       "method": "hyde",
       "top_k": 4,
       "rerank": true
     }'
```

### Response

```json
{
  "query": "What should I do if my company laptop gets stolen?",
  "method": "hyde",
  "answer": "If your company laptop is stolen, follow these steps immediately:\n\n1. **Report the theft:** Inform your supervisor or IT department immediately\n2. **File a police report:** This may be required for insurance purposes\n3. **Secure data:** Check with IT to confirm if the laptop was encrypted and change passwords for all accounts\n4. **Assess data risk:** Determine if sensitive company data was on the laptop and inform superiors\n5. **Use tracking software:** Check if the laptop has tracking software to locate or remotely wipe data\n6. **Insurance and replacement:** Inquire about company insurance coverage and replacement process\n7. **Document everything:** Keep detailed records for potential investigations\n\nThis follows Uptiq's IT and Security Policy requirements for handling stolen company equipment.",
  "execution_time": 3.89,
  "pipeline_stages": {
    "query_transformation": {
      "method": "hyde",
      "transformed_queries": [
        "Please write a scientific paper passage to answer the question: What should I do if my company laptop gets stolen?"
      ]
    },
    "retrieval": {
      "num_documents": 4,
      "documents": [
        "Company laptops must be secured when not in use...",
        "Report any security incidents immediately to the IT department...",
        "Passwords must be changed every 90 days...",
        "Personal devices are not permitted for company work..."
      ]
    },
    "routing": {
      "logical_routing": {
        "file_name": "it_and_security_policy.txt"
      },
      "semantic_routing": {
        "template_name": "it_template",
        "similarity_score": 0.94
      }
    }
  },
  "metadata": {}
}
```

## Error Response Example

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "test query",
       "method": "invalid_method"
     }'
```

### Error Response

```json
{
  "detail": "Pipeline error: Invalid transformation method: invalid_method"
}
```

## Health Check Request

```bash
curl -X GET "http://localhost:8000/health"
```

### Health Response

```json
{
  "status": "healthy",
  "timestamp": 1703123456.789,
  "pipeline_ready": true,
  "version": "1.0.0"
}
```

## Metrics Request

```bash
curl -X GET "http://localhost:8000/metrics"
```

### Metrics Response

```json
{
  "total_queries": 42,
  "average_response_time": 2.34,
  "pipeline_ready": true,
  "uptime": 3600.5
}
```
